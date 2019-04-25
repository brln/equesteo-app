import ImagePicker from 'react-native-image-crop-picker'
import { fromJS, Map  } from 'immutable'
import { AppState, NetInfo, Platform } from 'react-native'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import firebase from 'react-native-firebase'
import  Mixpanel from 'react-native-mixpanel'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'

import ApiClient from '../services/ApiClient'
import { DISTRIBUTION, ENV } from '../dotEnv'
import kalmanFilter from '../services/Kalman'
import { captureBreadcrumb, captureException, setUserContext } from "../services/Sentry"
import {
  goodConnection,
  haversine,
  horsePhotoURL,
  isAndroid,
  logError,
  logInfo,
  ridePhotoURL,
  unixTimeNow,
  profilePhotoURL
} from "../helpers"
import { danger, green, warning } from '../colors'
import {
  configureBackgroundGeolocation,
  loginAndSync,
  tryToLoadStateFromDisk
} from './helpers'
import {
  DRAWER,
  FEED,
  NEEDS_SYNC,
  NOTIFICATION_BUTTON,
  RIDE,
  RIDE_BUTTON,
  SIGNUP_LOGIN,
} from '../screens/main'
import {
  EqNavigation,
  LocalStorage,
  PouchCouch,
  RidePersister,
  UserAPI
} from '../services'
import { makeMessage } from '../modelHelpers/notification'
import {
  addDocsDownloaded,
  addDocsToDownload,
  careEventUpdated,
  carrotMutex,
  clearCurrentCareEvent,
  clearDocsNumbers,
  clearLastLocation,
  clearFeedMessage,
  clearState,
  deleteUnpersistedPhoto,
  dequeuePhoto,
  dismissError,
  enqueuePhoto,
  errorOccurred,
  horseCareEventUpdated,
  horsePhotoUpdated,
  horseUpdated,
  followUpdated,
  horseUserUpdated,
  localDataLoaded,
  newAppState,
  newLocation,
  newNetworkState,
  notificationUpdated,
  replaceLastLocation,
  rideAtlasEntryUpdated,
  rideCoordinatesLoaded,
  rideCarrotCreated,
  rideCarrotSaved,
  rideCommentUpdated,
  rideElevationsLoaded,
  ridePhotoUpdated,
  setFollowingSyncRunning,
  setRemotePersist,
  setFeedMessage,
  setFullSyncFail,
  setSigningOut,
  setActiveComponent,
  setLocationRetry,
  syncComplete,
  updatePhotoStatus,
  userPhotoUpdated,
  userSearchReturned,
  userUpdated
} from './standard'
import { NotConnectedError } from "../errors"

export const DB_NEEDS_SYNC = 'DB_NEEDS_SYNC'
export const DB_SYNCING = 'DB_SYNCING'
export const DB_SYNCING_AND_ENQUEUED = 'DB_SYNCING_AND_ENQUEUED'
export const DB_SYNCED = 'DB_SYNCED'


function cb(action, mixpanel=false) {
  logInfo('functionalAction: ' + action)
  captureBreadcrumb(action, 'functionalAction')
  if (mixpanel  && ENV !== 'local') {
    Mixpanel.track(action)
  }
}

export function catchAsyncError (dispatch, sentry=true) {
  return (e) => {
    if (!(e instanceof NotConnectedError)) {
      if (e.status === 401) {
        dispatch(signOut())
      }
      if (sentry) {
        captureBreadcrumb(JSON.stringify(e))
        captureException(e)
      }
      if (ENV === 'local') {
        logError(e, 'catchAsyncError')
      }
    }
  }
}

export function addHorseUser (horse, user) {
  cb('addHorseUser', true)
  return (dispatch, getState) => {
    const id = `${user.get('_id')}_${horse.get('_id')}`
    let newHorseUser = getState().getIn(['pouchRecords', 'horseUsers', id])
    if (newHorseUser) {
      newHorseUser = newHorseUser.set('deleted', false)
    } else {
      newHorseUser = Map({
        _id: id,
        type: 'horseUser',
        horseID: horse.get('_id'),
        userID: user.get('_id'),
        owner: false,
        createTime: unixTimeNow(),
        deleted: false,
      })
    }
    dispatch(horseUserUpdated(newHorseUser))
    dispatch(persistHorseUser(id))
  }
}

export function appInitialized () {
  cb('appInitialized', true)
  return (dispatch, getState) => {
    tryToLoadStateFromDisk(dispatch).then(() => {
      dispatch(startActiveComponentListener())
      dispatch(dismissError())
      dispatch(startAppStateTracking())

      // Just in case app died, this will clear the notification
      // just by opening app, so it's not stuck up there. Need to
      // not clear last so if app died and the continue current ride,
      // will keep working.
      dispatch(stopLocationTracking(false))
      return ApiClient.getToken()
    }).then((token) => {
      const currentUserID = getState().getIn(['localState', 'userID'])
      if (token && currentUserID) {
        setUserContext(currentUserID)
        Mixpanel.identify(currentUserID)
        Mixpanel.set({id: currentUserID})
        return PouchCouch.localLoad().then((localData) => {
          dispatch(localDataLoaded(localData))
          dispatch(startListeningFCMTokenRefresh())
          dispatch(startListeningFCM())
          dispatch(setDistributionOnServer())
          if (getState().getIn(['localState', 'lastFullSync'])) {
            dispatch(switchRoot(FEED))
          } else {
            dispatch(switchRoot(NEEDS_SYNC))
          }
          return dispatch(startNetworkTracking())
        }).then(() => {
          return dispatch(doSync({}, true, false))
        })
      } else {
        dispatch(switchRoot(SIGNUP_LOGIN))
      }
    }).catch(catchAsyncError(dispatch))
  }
}

export function changeHorseOwner (horse, newOwnerID) {
  cb('addHorseUser', true)
  return (dispatch, getState) => {
    let oldOwnerHorseUser = getState().getIn(['pouchRecords', 'horseUsers']).filter(hu => {
      return hu.get('horseID') === horse.get('_id') && hu.get('owner') === true
    }).first()
    oldOwnerHorseUser = oldOwnerHorseUser.set('owner', false).set('deleted', true)
    dispatch(horseUserUpdated(oldOwnerHorseUser))
    dispatch(persistHorseUser(oldOwnerHorseUser.get('_id', false)))

    const id = `${newOwnerID}_${horse.get('_id')}`
    let newHorseUser = getState().getIn(['pouchRecords', 'horseUsers', id])
    if (newHorseUser) {
      newHorseUser = newHorseUser.set('deleted', false).set('owner', true)
    } else {
      newHorseUser = Map({
        _id: id,
        type: 'horseUser',
        horseID: horse.get('_id'),
        userID: newOwnerID,
        owner: true,
        createTime: unixTimeNow(),
        deleted: false,
      })
    }
    dispatch(horseUserUpdated(newHorseUser))
    dispatch(persistHorseUser(id))


  }
}

export function checkFCMPermission () {
  cb('checkFCMPermission')
  return () => {
    return firebase.messaging().requestPermission().catch((error) => {
      logError(error)
    })
  }
}

export function clearRideNotifications (rideID) {
  cb('clearRideNotifications')
  return (dispatch, getState) => {
    const unseenNotifications = getState().getIn(['pouchRecords', 'notifications']).valueSeq().filter(n => {
      return n.get('seen') !== true && n.get('rideID') === rideID
    }).toList()
    const ids = unseenNotifications.map(n => n.get('_id'))
    dispatch(markNotificationsSeen(ids))
  }
}

export function createCareEvent () {
  cb('createCareEvent')
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    const careEventID = `${currentUserID}_${(new Date).getTime().toString()}`
    const newCareEvent = getState().getIn(['localState', 'newCareEvent'])
    const newCareHorseIDs = getState().getIn(['localState', 'newCareHorseIDs'])
    logDebug(newCareEvent.get('date'))
    const permaCareEvent = {
      _id: careEventID,
      type: 'careEvent',
      date: newCareEvent.get('date'),
      mainEventType: newCareEvent.get('mainEventType'),
      secondaryEventType: newCareEvent.get('secondaryEventType'),
      eventSpecificData: newCareEvent.get('eventSpecificData'),
      userID: currentUserID,
    }
    const asMap = Map(permaCareEvent)
    dispatch(careEventUpdated(asMap))
    PouchCouch.saveHorse(permaCareEvent).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'careEvents', careEventID])
      dispatch(careEventUpdated(afterSave.set('_rev', doc.rev)))

      let nextSave = Promise.resolve()
      for (let horseID of newCareHorseIDs) {
        const horseCareEventID = `${careEventID}_${horseID}`
        const permaHorseCareEvent = {
          _id: horseCareEventID,
          type: 'horseCareEvent',
          careEventID,
          horseID,
          userID: currentUserID,
        }
        const asMap = Map(permaHorseCareEvent)
        dispatch(horseCareEventUpdated(asMap))
        nextSave = nextSave.then(() => {
          PouchCouch.saveHorse(permaHorseCareEvent).then(doc => {
            const afterSave = getState().getIn(['pouchRecords', 'horseCareEvents', horseCareEventID])
            dispatch(horseCareEventUpdated(afterSave.set('_rev', doc.rev)))
          })
        })
      }
      nextSave.then(() => {
        dispatch(clearCurrentCareEvent())
        dispatch(doSync())
      })
    })
  }
}

export function createRideAtlasEntry(name, userID, ride, rideCoordinates, rideElevations) {
  cb('createRideAtlasEntry', true)
  return (dispatch, getState) => {
    const entryID = `${userID}_${ride.get('_id')}_${unixTimeNow()}`
    const newAtlasEntry = fromJS({
      _id: entryID,
      name,
      ride,
      rideCoordinates: {
        rideCoordinates: rideCoordinates.get('rideCoordinates').toJS(),
      },
      rideElevations: {
        elevations: rideElevations.get('elevations').toJS(),
      },
      type: 'rideAtlasEntry'
    })
    dispatch(rideAtlasEntryUpdated(newAtlasEntry))
    return PouchCouch.saveRide(newAtlasEntry.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'rideAtlasEntries', entryID])
      dispatch(rideAtlasEntryUpdated(afterSave.set('_rev', doc.rev)))
      dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function createRideComment(commentData) {
  cb('createRideComment', true)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    const commentID = `${currentUserID}_${(new Date).getTime().toString()}`
    const newComment = Map({
      _id: commentID,
      rideID: commentData.rideID,
      userID: currentUserID,
      deleted: false,
      type: 'comment',
      comment: commentData.comment,
      timestamp: commentData.timestamp
    })
    dispatch(rideCommentUpdated(newComment))
    PouchCouch.saveRide(newComment.toJS()).then((doc) => {
      const afterSave = getState().getIn(['pouchRecords', 'rideComments', commentID])
      dispatch(rideCommentUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function deleteCareEvent (careEvent) {
  cb('deleteCareEvent')
  return (dispatch, getState) => {
    const deleted = careEvent.set('deleted', true)
    dispatch(careEventUpdated(deleted))
    PouchCouch.saveHorse(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'careEvents', careEvent.get('_id')])
      dispatch(careEventUpdated(afterSave.set('_rev', doc.rev)))
      dispatch(doSync())
    })
  }
}

export function deleteHorseUser (horseUserID) {
  cb('deleteHorseUser', true)
  return (dispatch, getState) => {
    let theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw Error('Could not find horseUser')
    }
    theHorseUser = theHorseUser.set('deleted', true).set('rideDefault', false)
    dispatch(horseUserUpdated(theHorseUser))
  }
}

export function deleteRideAtlasEntry (entryID) {
  cb('deleteRideAtlasEntry', true)
  return (dispatch, getState) => {
    const theRideAtlasEntry = getState().getIn (['pouchRecords', 'rideAtlasEntries', entryID])
    const deleted = theRideAtlasEntry.set('deleted', true)
    dispatch(rideAtlasEntryUpdated(deleted))
    return PouchCouch.saveRide(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'rideAtlasEntries', entryID])
      dispatch(rideAtlasEntryUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function exchangePWCode (email, code) {
  cb('exchangePWCode')
  return (dispatch, getState) => {
    loginAndSync(UserAPI.exchangePWCodeForToken, [email, code], dispatch, getState)
  }
}

export function getPWCode (email) {
  cb('getPWCode', true)
  return (dispatch) => {
    UserAPI.getPWCode(email).catch(e => {
      dispatch(errorOccurred(e.message))
    })
  }
}

export function loadRideCoordinates (rideID) {
  cb('loadRideCoordinates')
  return (dispatch) => {
    PouchCouch.loadRideCoordinates(rideID).then((coords) => {
      dispatch(rideCoordinatesLoaded(coords))
    }).catch(catchAsyncError(dispatch))
  }
}

export function loadRideElevations (rideID) {
  cb('loadRideElevations')
  return (dispatch) => {
    PouchCouch.loadRideElevations(rideID).then((elevations) => {
      dispatch(rideElevationsLoaded(elevations))
    }).catch(e => {
      if (e.status === 404) {
        dispatch(rideElevationsLoaded(null))
      } else {
        catchAsyncError(dispatch)
      }
    })
  }
}

export function markNotificationsSeen (notificationIDs) {
  cb('markNotificationsSeen')
  return (dispatch, getState) => {
    let nextUp = Promise.resolve()
    for (let notificationID of notificationIDs) {
      const notification = getState().getIn(['pouchRecords', 'notifications', notificationID])
      const markSeen = notification.set('popped', true).set('seen', true).set('deleted', true)
      dispatch(notificationUpdated(markSeen))
      nextUp = nextUp.then(() => {
        return PouchCouch.saveNotification(markSeen.toJS()).then(({rev}) => {
          let foundAfterSave = getState().getIn(['pouchRecords', 'notifications', notification.get('_id')])
          dispatch(notificationUpdated(foundAfterSave.set('_rev', rev)))
        })
      })
    }
    nextUp.then(() => {
      return dispatch(doSync({}, false))
    }).catch(catchAsyncError(dispatch))
  }
}

export function markNotificationPopped (notification) {
  cb('markNotificationPopped')
  return (dispatch, getState) => {
    const markPopped = notification.set('popped', true)
    dispatch(notificationUpdated(markPopped))
    PouchCouch.saveNotification(markPopped.toJS()).then(({rev}) => {
      let foundAfterSave = getState().getIn(['pouchRecords', 'notifications', notification.get('_id')])
      dispatch(notificationUpdated(foundAfterSave.set('_rev', rev)))
    }).catch(catchAsyncError(dispatch))
  }
}

export function newPassword (password) {
  cb('newPassword')
  return (dispatch) => {
    UserAPI.changePassword(password).catch(catchAsyncError(dispatch))
  }
}

export function persistFollow (followID, creating) {
  cb('persistFollow')
  return (dispatch, getState) => {
    const theFollow = getState().getIn(['pouchRecords', 'follows', followID])
    if (!theFollow) {
      throw new Error('no follow with that ID')
    }
    if (creating) {
      dispatch(setFollowingSyncRunning(true))
    }
    return PouchCouch.saveUser(theFollow.toJS()).then(({ rev }) => {
      let foundAfterSave = getState().getIn(['pouchRecords', 'follows', followID])
      dispatch(followUpdated(foundAfterSave.set('_rev', rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistRide (rideID, newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
  cb('persistRide', true)
  return (dispatch, getState) => {
    const ridePersister = new RidePersister(dispatch, getState, rideID)
    return ridePersister.persistRide(newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses)
  }
}

export function persistUserWithPhoto (userID, userPhotoID) {
  cb('persistUserWithPhoto', true)
  return (dispatch, getState) => {
    const theUserPhoto = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
    if (!theUserPhoto) {
      throw new Error('no user photo with that ID: ' + userPhotoID)
    }

    PouchCouch.saveUser(theUserPhoto.toJS()).then(({ rev }) => {
      const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
      dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', rev)))
      dispatch(photoNeedsUpload('user', theUserPhoto.get('uri'), userPhotoID))
      const theUser = getState().getIn(['pouchRecords', 'users', userID])
      if (!theUser) {
        throw new Error('no user with that ID')
      }
      return PouchCouch.saveUser(theUser.toJS())
    }).then(({ rev }) => {
      const theUserAfterSave = getState().getIn(['pouchRecords', 'users', userID])
      dispatch(userUpdated(theUserAfterSave.set('_rev', rev)))
    }).then(() => {
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseWithPhoto (horseID, horsePhotoID) {
  cb('persistHorseWithPhoto', true)
  return (dispatch, getState) => {
    const theHorsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', horsePhotoID])
    if (!theHorsePhoto) {
      throw new Error('no horse photo with that ID')
    }
    PouchCouch.saveHorse(theHorsePhoto.toJS()).then((doc) => {
      const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', horsePhotoID])
      dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
      dispatch(photoNeedsUpload('horse', theHorsePhoto.get('uri'), horsePhotoID))
      const theHorse = getState().getIn(['pouchRecords', 'horses', horseID])
      if (!theHorse) {
        throw new Error('no horse with that ID')
      }
      return PouchCouch.saveHorse(theHorse.toJS())
    }).then((doc) => {
      const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
      dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseUpdate (horseID, horseUserID, deletedPhotoIDs, newPhotoIDs, previousDefaultValue) {
  cb('persistHorseUpdate', true)
  return (dispatch, getState) => {
    const theHorse = getState().getIn(['pouchRecords', 'horses', horseID])
    if (!theHorse) {
      throw new Error('no horse with that ID')
    }
    const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw new Error('no horse user with that ID')
    }

    const horseSaves = PouchCouch.saveHorse(theHorse.toJS()).then((doc) => {
      const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
      dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
      const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
      return PouchCouch.saveHorse(theHorseUser.toJS())
    }).then(({ rev }) => {
      const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
      dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', rev)))
    })

    for (let photoID of deletedPhotoIDs) {
      if (newPhotoIDs.indexOf(photoID) < 0) {
        horseSaves.then(() => {
          const theHorsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
          const deleted = theHorsePhoto.set('deleted', true)
          dispatch(horsePhotoUpdated(deleted))
          return PouchCouch.saveHorse(deleted.toJS()).then((doc) => {
            const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
            dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
          })
        })
      } else {
        dispatch(deleteUnpersistedPhoto('horsePhotos', photoID))
      }
    }

    for (let photoID of newPhotoIDs) {
      if (deletedPhotoIDs.indexOf(photoID) < 0) {
        horseSaves.then(() => {
          const theHorsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
          return PouchCouch.saveHorse(theHorsePhoto.toJS()).then((doc) => {
            const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
            dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
            const photoLocation = theHorsePhotoAfterSave.get('uri')
            dispatch(photoNeedsUpload('horse', photoLocation, photoID))
          })
        })
      }
    }

    const userID = getState().getIn(['localState', 'userID'])
    const horseUsers = getState().getIn(['pouchRecords', 'horseUsers']).filter(hu => hu.get('userID') === userID)
    if (previousDefaultValue !== theHorseUser.get('rideDefault')
      && theHorseUser.get('rideDefault') === true) {
      horseUsers.valueSeq().forEach(horseUser => {
        if (horseUser.get('_id') !== theHorseUser.get('_id') && horseUser.get('rideDefault') === true) {
          horseSaves.then(() => {
            const withoutDefault = horseUser.set('rideDefault', false)
            dispatch(horseUserUpdated(withoutDefault))
            return PouchCouch.saveHorse(withoutDefault.toJS()).then((doc) => {
              const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', withoutDefault.get('_id')])
              dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', doc.rev)))
            })
          })
        }
      })
    }

    horseSaves.then(() => {
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseUser (horseUserID, runSyncNow=true) {
  cb('persistHorseUser', true)
  return (dispatch, getState) => {
    const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw new Error('no horse user with that ID')
    }
    return PouchCouch.saveHorse(theHorseUser.toJS()).then(({ rev }) => {
      const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
      dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', rev)))
      if (runSyncNow) {
        return dispatch(doSync())
      }
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistUserUpdate (userID, deletedPhotoIDs) {
  cb('persistUserUpdate', true)
  return (dispatch, getState) => {
    const theUser = getState().getIn(['pouchRecords', 'users', userID])
    if (!theUser) {
      throw new Error('no user with that ID')
    }
    const userSave = PouchCouch.saveUser(theUser.toJS())

    userSave.then(({ rev }) => {
      const theUserAfterSave = getState().getIn(['pouchRecords', 'users', userID])
      dispatch(userUpdated(theUserAfterSave.set('_rev', rev)))
    })

    for (let userPhotoID of deletedPhotoIDs) {
      const theUserPhoto = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
      if (!theUserPhoto) {
        throw new Error('no user photo with that ID: ' + userPhotoID)
      }
      const markedDeleted = theUserPhoto.set('deleted', true)
      dispatch(userPhotoUpdated(markedDeleted))
      userSave.then(() => {
        return PouchCouch.saveUser(markedDeleted.toJS())
      }).then(({ rev }) => {
        const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
        dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', rev)))
      })
    }

    userSave.then(() => {
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch))
  }
}

export function photoNeedsUpload (type, photoLocation, photoID) {
  cb('photoNeedsUpload', true)
  return (dispatch) => {
    const item = Map({
      type,
      photoLocation,
      photoID,
      status: 'enqueued',
      timestamp: unixTimeNow()
    })
    dispatch(enqueuePhoto(item))
    dispatch(runPhotoQueue())
  }
}

export function runPhotoQueue() {
  cb('runPhotoQueue')
  return (dispatch, getState) => {
    getState().getIn(['localState', 'photoQueue']).forEach((p) => {
      if (p.get('status') === 'enqueued'
        || p.get('status') === 'failed'
        || p.get('status') === 'uploading' && unixTimeNow() - p.get('timestamp') > 60000) {
        dispatch(uploadPhoto(
          p.get('type'),
          p.get('photoLocation'),
          p.get('photoID'),
        ))
      }
    })
  }
}

export function uploadPhoto (type, photoLocation, photoID) {
  cb('uploadPhoto', true)
  return (dispatch, getState) => {
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    if (goodConnection) {
      dispatch(updatePhotoStatus(photoID, 'uploading'))
      UserAPI.uploadPhoto(type, photoLocation, photoID).then(() => {
        switch (type) {
          case 'horse':
            const uploadedHorseURI = horsePhotoURL(photoID)
            const horsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID]).set('uri', uploadedHorseURI)
            dispatch(horsePhotoUpdated(horsePhoto))
            return PouchCouch.saveHorse(horsePhoto.toJS()).then((doc) => {
              const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
              dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
              return dispatch(doSync({}, false))
            })
          case 'ride':
            const uploadedRideURI = ridePhotoURL(photoID)
            const ridePhoto = getState().getIn(['pouchRecords', 'ridePhotos', photoID]).set('uri', uploadedRideURI)
            dispatch(ridePhotoUpdated(ridePhoto))
            return PouchCouch.saveRide(ridePhoto.toJS()).then((doc) => {
              const theRidePhotoAfterSave = getState().getIn(['pouchRecords', 'ridePhotos', photoID])
              dispatch(ridePhotoUpdated(theRidePhotoAfterSave.set('_rev', doc.rev)))
              return dispatch(doSync({}, false))
            })
          case 'user':
            const uploadedUserPhotoURI = profilePhotoURL(photoID)
            const userPhoto = getState().getIn(['pouchRecords', 'userPhotos', photoID]).set('uri', uploadedUserPhotoURI)
            dispatch(userPhotoUpdated(userPhoto))
            return PouchCouch.saveUser(userPhoto.toJS()).then((doc) => {
              const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', photoID])
              dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', doc.rev)))
              return dispatch(doSync({}, false))
            })
          default:
            throw Error('cant persist type I don\'t know about')
        }
      }).then(() => {
        dispatch(dequeuePhoto(photoID))
        ImagePicker.cleanSingle(photoLocation).catch(e => {
          logError(e, 'ImagePicker.cleanSingle')
        })
      }).catch(e => {
        logError(e, 'uploadPhoto')
        dispatch(updatePhotoStatus(photoID, 'failed'))
        catchAsyncError(dispatch)(e)
      })
    }
  }
}

export function searchForFriends (phrase) {
  cb('searchForFriends', true)
  return (dispatch) => {
    UserAPI.findUser(phrase).then(resp => {
      dispatch(userSearchReturned(fromJS(resp)))
    }).catch(catchAsyncError(dispatch))
  }
}

export function setFCMTokenOnServer (token) {
  cb('setFCMTokenOnServer')
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    logInfo('setting fcm token')
    UserAPI.setFCMToken(currentUserID, token, Platform.OS).then(() => {
      logInfo('FCM token set')
    }).catch(catchAsyncError(dispatch))
  }
}

export function setDistributionOnServer () {
  cb('setDistributionOnServer')
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    logInfo('setting distribution')
    UserAPI.setDistribution(currentUserID, DISTRIBUTION).then(() => {
      logInfo('Distribution Set')
    }).catch(catchAsyncError(dispatch))
  }
}

export function signOut () {
  cb('signOut', true)
  return (dispatch, getState) => {
    if (!getState().getIn(['localState', 'signingOut'])) {
      dispatch(setSigningOut(true))
      dispatch(stopLocationTracking())
      FCMTokenRefreshListenerRemover ? FCMTokenRefreshListenerRemover() : null
      firebase.iid().deleteToken('373350399276', 'GCM').catch(e => {
        logError(e, 'signOut.stopListeningFCM')
      }).then(() => {
        return Promise.all([
          PouchCouch.deleteLocalDBs(),
          LocalStorage.deleteLocalState(),
          ApiClient.clearToken(),
        ])
      }).then(() => {
        const activeComponent = getState().getIn(['localState', 'activeComponent'])
        if (activeComponent !== FEED) {
          return Navigation.popToRoot(activeComponent)
        }
      }).then(() => {
        dispatch(switchRoot(SIGNUP_LOGIN))
        dispatch(clearState())
        dispatch(setSigningOut(false))
      }).catch(catchAsyncError(dispatch))
    }
  }
}

export function showLocalNotifications () {
  cb('showLocalNotification')
  return (dispatch, getState) => {
    PushNotification.configure({
      onNotification: (meta) => {
        if (meta.userInteraction) {
          let notification = getState().getIn(['pouchRecords', 'notifications']).filter(n => {
            return n.get('notificationID') === meta.id
          }).first()
          const skipToComments = notification.get('notificationType') === 'newComment'
          dispatch(markNotificationsSeen([notification.get('_id')]))

          const currentlyViewing = getState().getIn(['localState', 'showingRide'])
          if (currentlyViewing !== notification.get('rideID')) {
            EqNavigation.push(getState().getIn(['localState', 'activeComponent']), {
              component: {
                name: RIDE,
                passProps: {
                  rideID: notification.get('rideID'),
                  skipToComments,
                }
              }
            })
          }
        }
      }
    })
    const unpoppedNotifications = getState().getIn(['pouchRecords', 'notifications']).valueSeq().filter(n => {
      return n.get('popped') !== true
    }).toList()
    for (let notification of unpoppedNotifications) {
      const message = makeMessage(notification.toJS())
      PushNotification.localNotification({
        id: notification.get('notificationID'),
        message,
      })
      dispatch(markNotificationPopped(notification))
    }
  }
}

export function retryLocationTracking () {
  cb('retryLocationTracking')
  return (dispatch, getState) => {
    dispatch(setLocationRetry(true))
    setTimeout(() => {
      if(getState().getIn(['localState', 'locationRetry'])) {
        const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
        if (!lastLocation) {
          BackgroundGeolocation.stop()
          BackgroundGeolocation.removeAllListeners('location')
          dispatch(startLocationTracking())
        }
      }
    }, 30000)
  }
}

export function startLocationTracking () {
  cb('startLocationTracking')
  return (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    return configureBackgroundGeolocation().then(() => {
      const KALMAN_FILTER_Q = 6
      BackgroundGeolocation.on('error', (error) => {
        logError(error, 'BackgroundGeolocation.error')
        captureException(error)
      })

      BackgroundGeolocation.on('location', (location) => {
        if (location.accuracy > 50) {
          return
        }

        const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
        let timeDiff = 0
        if (lastLocation) {
          timeDiff = (location.time / 1000) - (lastLocation.get('timestamp') / 1000)
        } else {
          dispatch(setLocationRetry(false))
        }

        if (!lastLocation || timeDiff > 5) {
          const refiningLocation = getState().getIn(['currentRide', 'refiningLocation'])

          let parsedLocation = Map({
            accuracy: location.accuracy,
            latitude: location.latitude,
            longitude: location.longitude,
            provider: location.provider,
            timestamp: location.time,
            speed: location.speed,
          })

          let parsedElevation = Map({
            latitude: location.latitude,
            longitude: location.longitude,
            elevation: location.altitude,
          })

          let replaced = false
          if (refiningLocation && lastLocation) {
            // If you have at least one point already recorded, run the Kalman filter
            // on the new location coming in using the one you already have
            parsedLocation = kalmanFilter(
              parsedLocation,
              lastLocation,
              KALMAN_FILTER_Q
            )
            parsedElevation = parsedElevation.set(
              'latitude', parsedLocation.get('latitude')
            ).set(
              'longitude', parsedLocation.get('longitude')
            ).set(
              'accuracy', parsedLocation.get('accuracy')
            )

            let distance = haversine(
              refiningLocation.get('latitude'),
              refiningLocation.get('longitude'),
              parsedLocation.get('latitude'),
              parsedLocation.get('longitude')
            )
            if (distance < (30 / 5280)) {
              // If you're within a 30' radius of the last place you were, don't
              // just add the point on, replace the old one.
              dispatch(replaceLastLocation(parsedLocation, parsedElevation))
              replaced = true
            }
          }
          if (!replaced) {
            dispatch(newLocation(parsedLocation, parsedElevation))
          }
        }
      })

      BackgroundGeolocation.start()
      dispatch(retryLocationTracking())

    }).catch(catchAsyncError(dispatch))
  }
}

export function checkNetworkConnection () {
  cb('startListeningFCM')
  return (dispatch, getState) => {
    ApiClient.checkConnection().then(resp => {
      dispatch(newNetworkState(resp.connected))
      if (resp.connected) {
        dispatch(runPhotoQueue())
        const needsPersist = getState().getIn(['localState', 'needsRemotePersist']) === DB_NEEDS_SYNC
        if (needsPersist) {
          dispatch(doSync()).catch(catchAsyncError(dispatch))
        }
      }
    })
  }
}

let networkListenerRemover = null
export function startNetworkTracking () {
  cb('startNetworkTracking')
  return (dispatch, getState) => {
    if (networkListenerRemover) {
      networkListenerRemover.remove()
    }

    const listener = () => {
      setTimeout (() => {
        dispatch(checkNetworkConnection())
      }, 2000)
    }

    networkListenerRemover = NetInfo.addEventListener('connectionChange', listener)
    listener()
  }
}

export function startListeningFCM () {
  cb('startListeningFCM')
  return (dispatch, getState) => {
    firebase.messaging().onMessage((m) => {
      const inForeground = getState().getIn(['localState', 'appState']) === 'active'
      if (isAndroid() || inForeground) {
        dispatch(doSync({}, false)).then(() => {
          dispatch(showLocalNotifications())
        })
      }
    })
    firebase.notifications().onNotificationOpened(() => {
      dispatch(doSync())
    })
  }
}

let FCMTokenRefreshListenerRemover = null
export function startListeningFCMTokenRefresh () {
  cb('startListeningFCMTokenRefresh')
  return (dispatch) => {
    firebase.messaging().getToken().then(newToken => {
      if (newToken) {
        dispatch(setFCMTokenOnServer(newToken))
      }
    })
    FCMTokenRefreshListenerRemover = firebase.messaging().onTokenRefresh((newToken) => {
      dispatch(setFCMTokenOnServer(newToken))
    })
  }
}

function startActiveComponentListener () {
  cb('startActiveComponentListener')
  return (dispatch, getState) => {
    Navigation.events().registerComponentDidAppearListener( ( { componentId } ) => {
      if (componentId !== DRAWER && componentId !== RIDE_BUTTON && componentId !== NOTIFICATION_BUTTON) {
        dispatch(setActiveComponent(componentId))
      }
    })
  }
}

export function stopLocationTracking (clearLast=true) {
  cb('stopLocationTracking')
  return (dispatch) => {
    dispatch(setLocationRetry(false))
    BackgroundGeolocation.stop()
    BackgroundGeolocation.removeAllListeners('location')
    if (clearLast) {
      dispatch(clearLastLocation())
    }
  }
}

function startAppStateTracking () {
  cb('startAppStateTracking')
  return (dispatch) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
    })
  }
}

export function submitLogin (email, password) {
  cb('submitLogin', true)
  return (dispatch, getState) => {
    loginAndSync(UserAPI.login, [email, password], dispatch, getState)
  }
}

export function submitSignup (email, password) {
  cb('submitSignup', true)
  return (dispatch, getState) => {
    loginAndSync(UserAPI.signup, [email, password], dispatch, getState)
  }
}

export function pulldownSync () {
  return (dispatch) => {
    dispatch(doSync({}, true, false)).catch(catchAsyncError(dispatch))
  }
}

export function doSync (syncData={}, showProgress=true, doUpload=true) {
  cb('doSync', true)
  return (dispatch, getState) => {
    function feedMessage(message, color, timeout) {
      if (showProgress) {
        dispatch(setFeedMessage(Map({
          message,
          color,
        })))
        if (timeout) {
          setTimeout(() => {
            dispatch(clearFeedMessage())
          }, timeout)
        }
      }
    }

    const progress = {
      doneDocsFunc: (num, db) => {
        dispatch(addDocsDownloaded(num, db))
      },
      moreDocsFunc: (num) => {
        dispatch(addDocsToDownload(num))
      }
    }


    if (getState().getIn(['localState', 'goodConnection'])) {
      dispatch(clearDocsNumbers())
      dispatch(runPhotoQueue())

      const remotePersistStatus = getState().getIn(['localState', 'needsRemotePersist'])
      if (remotePersistStatus === DB_SYNCING) {
        // If a sync has already started, wait 5 seconds then run another one.
        // This gives time for everything (photo uploads, mostly) to settle,
        // then they can all go with one sync.
        dispatch(setRemotePersist(DB_SYNCING_AND_ENQUEUED))
        setTimeout(() => {
          dispatch(doSync(syncData, showProgress)).catch(catchAsyncError(dispatch))
        }, 5000)
        return Promise.resolve()
      } else {
        dispatch(setRemotePersist(DB_SYNCING))
      }

      dispatch(setFullSyncFail(true))
      let upload = Promise.resolve()
      if (remotePersistStatus === DB_NEEDS_SYNC || doUpload) {
        feedMessage('Uploading...', warning, null)
        upload = PouchCouch.remoteReplicateDBs()
      }
      return upload.then(() => {
        let userID = syncData.userID
        let followingIDs = syncData.followingIDs
        let followerIDs = syncData.followerIDs
        if (!Object.keys(syncData).length) {
          userID = getState().getIn(['localState', 'userID'])
          const follows = getState().getIn(['pouchRecords', 'follows'])
          followingIDs = follows.valueSeq().filter(
            f => !f.get('deleted') && f.get('followerID') === userID
          ).map(
            f => f.get('followingID')
          ).toJS()

          followerIDs = follows.valueSeq().filter(
            f => !f.get('deleted') && f.get('followingID') === userID
          ).map(
            f => f.get('followerID')
          ).toJS()
        }
        feedMessage('Downloading...', warning, null)
        return PouchCouch.localReplicateDBs(userID, followingIDs, followerIDs, progress)
      }).then(() => {
        feedMessage('Calculating...', warning, null)
        return PouchCouch.localLoad()
      }).then(localData => {
        dispatch(localDataLoaded(localData))
        dispatch(setRemotePersist(DB_SYNCED))
        dispatch(syncComplete())
        dispatch(setFullSyncFail(false))
        dispatch(setFollowingSyncRunning(false))
        feedMessage('Sync Complete', green, 3000)
      }).catch((e) => {
        dispatch(setFullSyncFail(true))
        dispatch(setRemotePersist(DB_NEEDS_SYNC))
        feedMessage('Error Syncing Data', danger, 5000)
        logError(e, 'doSync.remoteReplicateDBs')
        if (!(e instanceof NotConnectedError)) {
          throw e
        }
      })
    } else {
      dispatch(setFullSyncFail(true))
      feedMessage('No Internet Connection', warning, 10000)
      dispatch(checkNetworkConnection())
      return Promise.resolve()
    }
  }
}


export function switchRoot (newRoot) {
  cb('switchRoot')
  return () => {
    if (newRoot === FEED) {
      Navigation.setRoot({
        root: Platform.select({
          android: {
            sideMenu: {
              left: {
                component: {name: DRAWER, id: DRAWER}
              },
              center: {
                stack: {
                  children: [{
                    component: {
                      name: FEED,
                      id: FEED,
                      options: {
                        topBar: {
                          elevation: 0
                        }
                      }
                    },
                  }]
                }
              },
            }
          },
          ios: {
            stack: {
              children: [{
                component: {
                  name: FEED,
                  id: FEED,
                  options: {
                    topBar: {
                      elevation: 0
                    }
                  }
                }
              }]
            }
          }
        })
      })
    } else if (newRoot === SIGNUP_LOGIN) {
      Navigation.setRoot({
        root: {
          component: {
            name: SIGNUP_LOGIN,
            id: SIGNUP_LOGIN
          },
        }
      })
    } else if (newRoot = NEEDS_SYNC) {
      Navigation.setRoot({
        root: {
          component: {
            name: NEEDS_SYNC,
            id: NEEDS_SYNC
          },
        }
      })
    } else {
      throw Error('That\'s a bad route, jerk.')
    }
  }
}

export function toggleRideCarrot (rideID) {
  cb('toggleRideCarrot', true)
  return (dispatch, getState) => {
    const mutexSet = getState().getIn(['localState', 'carrotMutex'])
    if (!mutexSet) {
      dispatch(carrotMutex(true))
      const currentUserID = getState().getIn(['localState', 'userID'])
      let existing = getState().getIn(['pouchRecords', 'rideCarrots']).valueSeq().filter((c) => {
        return c.get('rideID') === rideID && c.get('userID') === currentUserID
      })
      existing = existing.count() > 0 ? existing.first() : null

      let save
      if (existing) {
        let toggled = existing.set('deleted', !existing.get('deleted'))
        dispatch(rideCarrotSaved(toggled))
        save = PouchCouch.saveRide(toggled.toJS()).then((doc) => {
          let afterSave = getState().getIn(['pouchRecords', 'rideCarrots', toggled.get('_id')])
          let withRev = afterSave.set('_rev', doc.rev)
          dispatch(rideCarrotSaved(withRev))
        })
      } else {
        const carrotID = `${currentUserID}_${(new Date).getTime().toString()}`
        const newCarrot = Map({
          _id: carrotID,
          rideID,
          userID: currentUserID,
          deleted: false,
          type: 'carrot'
        })
        dispatch(rideCarrotCreated(newCarrot))
        save = PouchCouch.saveRide(newCarrot.toJS()).then(doc => {
          let afterSave = getState().getIn(['pouchRecords', 'rideCarrots', carrotID])
          dispatch(rideCarrotSaved(afterSave.set('_rev', doc.rev)))
        })
      }
      save.then(() => {
        dispatch(carrotMutex(false))
        return dispatch(doSync({}, false))
      }).catch(catchAsyncError(dispatch))
    }
  }
}
