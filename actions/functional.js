import BackgroundTimer from 'react-native-background-timer'
import ImagePicker from 'react-native-image-crop-picker'
import { fromJS, Map  } from 'immutable'
import { Alert, AppState, Linking, NetInfo, Platform } from 'react-native'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'
import BackgroundFetch from "react-native-background-fetch"
import Tts from 'react-native-tts'
import URI from 'urijs'

import ApiClient from '../services/ApiClient'
import { DISTRIBUTION, ENV } from '../dotEnv'
import kalmanFilter from '../services/Kalman'
import Amplitude, { APP_INITIALIZED, GIVE_CARROT } from "../services/Amplitude"
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
  LOGIN,
  NEEDS_SYNC,
  NEW_PASSWORD,
  NOTIFICATION_BUTTON,
  RIDE,
  RIDE_BUTTON,
  SIGNUP,
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
  gpsSignalLost,
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
  setHoofTracksLastUpload,
  setHoofTracksRunning,
  setHoofTracksID,
  setFullSyncFail,
  setSigningOut,
  setActiveComponent,
  syncComplete,
  updatePhotoStatus,
  userPhotoUpdated,
  userSearchReturned,
  userUpdated, setBackgroundGeolocationRunning, setShutdownInProgress,
} from './standard'
import { NotConnectedError } from "../errors"

export const DB_NEEDS_SYNC = 'DB_NEEDS_SYNC'
export const DB_SYNCING = 'DB_SYNCING'
export const DB_SYNCED = 'DB_SYNCED'

Tts.setDucking(true)

function cb(action) {
  logInfo('functionalAction: ' + action)
  captureBreadcrumb(action, 'functionalAction')
}

export function catchAsyncError (dispatch, source) {
  return (e) => {
    if (!(e instanceof NotConnectedError)) {
      if (e && e.status === 401) {
        dispatch(signOut())
      }
      captureBreadcrumb(source)
      captureException(e)
      if (ENV === 'local') {
        alert('Async error, check logs')
        logError(e, 'catchAsyncError')
      }
    }
  }
}

export function addHorseUser (horse, user) {
  const source = source
  cb(source)
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

let listener
export function startForgotPWLinkListener () {
  return (dispatch, getState) => {
    listener = ({ url }) => {
      const parsedURL = URI(url)
      const token = parsedURL.search(true).t
      const email = atob(parsedURL.search(true).e)
      if (email && token) {
        console.log(email)
        console.log(token)
        dispatch(exchangePWCode(email, token)).then(() => {
          EqNavigation.push(getState().getIn(['localState', 'activeComponent']), {
            component: {
              name: NEW_PASSWORD
            }
          })
        }).catch(e => {
          dispatch(errorOccurred(e.message))
        })
      }
    }
    Linking.addEventListener('url', listener)
  }
}

export function removeForgotPWLinkListener () {
  return () => {
    if (listener) {
      Linking.removeEventListener('url', listener)
    }
  }
}

export function appInitialized () {
  const source = 'appInitialized'
  cb(source)
  return (dispatch, getState) => {
    let postSync = () => {}
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
        Amplitude.setUserID(currentUserID)
        return PouchCouch.localLoad().then((localData) => {
          dispatch(localDataLoaded(localData))
          dispatch(startListeningFCMTokenRefresh())
          dispatch(startListeningFCM())
          if (getState().getIn(['localState', 'lastFullSync'])) {
            Amplitude.logEvent(APP_INITIALIZED)
            dispatch(switchRoot(FEED))
          } else {
            dispatch(switchRoot(NEEDS_SYNC))
            postSync = () => {
              dispatch(switchRoot(FEED))
            }
          }
          return dispatch(startNetworkTracking())
        }).then(() => {
          return dispatch(doSync({}, true, false)).then(postSync).catch(catchAsyncError(dispatch, source))
        }).then(() => {
          dispatch(startBackgroundFetch())
        }).then(() => {
          // setDistribution needs to be far apart from FCMToken or they
          // end up in a race condition on the server. really, need to
          // consolidate the two calls.
          return dispatch(setDistributionOnServer())
        })
      } else {
        if (getState().getIn(['localState', 'everLoggedIn'])) {
          dispatch(switchRoot(LOGIN))
        } else {
          dispatch(switchRoot(SIGNUP))
        }
        dispatch(startForgotPWLinkListener())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function changeHorseOwner (horse, newOwnerID) {
  const source = 'addHorseUser'
  cb(source)
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

export function clearRideNotifications (rideID) {
  const source = 'clearRideNotifications'
  cb(source)
  return (dispatch, getState) => {
    const unseenNotifications = getState().getIn(['pouchRecords', 'notifications']).valueSeq().filter(n => {
      return n.get('seen') !== true && n.get('rideID') === rideID
    }).toList()
    const ids = unseenNotifications.map(n => n.get('_id'))
    dispatch(markNotificationsSeen(ids))
  }
}

export function createCareEvent () {
  const source = 'createCareEvent'
  cb(source)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    const careEventID = `${currentUserID}_${(new Date).getTime().toString()}`
    const newCareEvent = getState().getIn(['localState', 'newCareEvent'])
    const newCareHorseIDs = getState().getIn(['localState', 'newCareHorseIDs'])
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
        return dispatch(doSync())
      }).catch(catchAsyncError(dispatch, source))
    })
  }
}

export function createRideAtlasEntry(name, userID, ride, rideCoordinates, rideElevations) {
  const source = 'createRideAtlasEntry'
  cb(source)
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
      dispatch(doSync()).catch(catchAsyncError(dispatch, source))
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function createRideComment(commentData) {
  const source = 'createRideComment'
  cb(source)
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
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function deleteCareEvent (careEvent) {
  const source = 'deleteCareEvent'
  cb(source)
  return (dispatch, getState) => {
    const deleted = careEvent.set('deleted', true)
    dispatch(careEventUpdated(deleted))
    PouchCouch.saveHorse(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'careEvents', careEvent.get('_id')])
      dispatch(careEventUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function deleteHorseUser (horseUserID) {
  const source = 'deleteHorseUser'
  cb(source)
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
  const source = 'deleteRideAtlasEntry'
  cb(source)
  return (dispatch, getState) => {
    const theRideAtlasEntry = getState().getIn (['pouchRecords', 'rideAtlasEntries', entryID])
    const deleted = theRideAtlasEntry.set('deleted', true)
    dispatch(rideAtlasEntryUpdated(deleted))
    return PouchCouch.saveRide(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'rideAtlasEntries', entryID])
      dispatch(rideAtlasEntryUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function exchangePWCode (email, code) {
  const source = 'exchangePWCode'
  cb(source)
  return () => {
    return UserAPI.exchangePWCodeForToken(email, code)
  }
}

export function getPWCode (email) {
  const source = 'getPWCode'
  cb(source)
  return (dispatch) => {
    return UserAPI.getPWCode(email).catch(e => {
      dispatch(errorOccurred(e.message))
    })
  }
}

export function loadRideCoordinates (rideID) {
  const source = 'loadRideCoordinates'
  cb(source)
  return (dispatch) => {
    return PouchCouch.loadRideCoordinates(rideID).then((coords) => {
      dispatch(rideCoordinatesLoaded(coords))
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function loadRideElevations (rideID) {
  const source = 'loadRideElevations'
  cb(source)
  return (dispatch) => {
    return PouchCouch.loadRideElevations(rideID).then((elevations) => {
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

export function loadSingleRide (rideID) {
  const source = 'loadSingleRide'
  cb(source)
  return (dispatch) => {
    return PouchCouch.localReplicateRide(rideID).then(() => {
      return PouchCouch.localLoad()
    }).then(localData => {
      dispatch(localDataLoaded(localData))
      return loadRideCoordinates(rideID)
    }).then(() => {
      return loadRideElevations(rideID)
    }).catch(e => {
      // Everywhere else, we ignore the NotConnectedError, but here we
      // need to know so the Training page and NotificationList can react
      // to the fact that we can't load a ride.
      if (e instanceof NotConnectedError) {
        throw e
      } else {
        catchAsyncError(dispatch, 'loadSingleRide')
      }

    })
  }
}

export function markNotificationsSeen (notificationIDs) {
  const source = 'markNotificationsSeen'
  cb(source)
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
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function markNotificationPopped (notification) {
  const source = 'markNotificationPopped'
  cb(source)
  return (dispatch, getState) => {
    const markPopped = notification.set('popped', true)
    dispatch(notificationUpdated(markPopped))
    PouchCouch.saveNotification(markPopped.toJS()).then(({rev}) => {
      let foundAfterSave = getState().getIn(['pouchRecords', 'notifications', notification.get('_id')])
      dispatch(notificationUpdated(foundAfterSave.set('_rev', rev)))
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function newPassword (password) {
  const source = 'newPassword'
  cb(source)
  return (dispatch, getState) => {
    return loginAndSync(UserAPI.changePassword, [password], dispatch, getState)
  }
}

export function persistFollow (followID, creating) {
  const source = 'persistFollow'
  cb(source)
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
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function persistRide (rideID, newRide, rideCoordinates, rideElevations, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
  const source = 'persistRide'
  cb(source)
  return (dispatch, getState) => {
    const ridePersister = new RidePersister(dispatch, getState, rideID)
    return ridePersister.persistRide(newRide, rideCoordinates, rideElevations, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses)
  }
}

export function persistUserWithPhoto (userID, userPhotoID, doSyncNow) {
  const source = 'persistUserWithPhoto'
  cb(source)
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
      if (doSyncNow) {
        return dispatch(doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function persistHorseWithPhoto (horseID, horsePhotoID, doSyncNow) {
  const source = 'persistHorseWithPhoto'
  cb(source)
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
      if (doSyncNow) {
        return dispatch(doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function persistHorseUpdate (horseID, horseUserID, deletedPhotoIDs, newPhotoIDs, previousDefaultValue, doSyncNow) {
  const source = 'persistHorseUpdate'
  cb(source)
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
      if (doSyncNow) {
        return dispatch(doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function persistHorseUser (horseUserID, runSyncNow=true) {
  const source = 'persistHorseUser'
  cb(source)
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
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function persistUserUpdate (userID, deletedPhotoIDs, doSyncNow) {
  const source = 'persistUserUpdate'
  cb(source)
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
      if (doSyncNow) {
        return dispatch(doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function photoNeedsUpload (type, photoLocation, photoID) {
  const source = 'photoNeedsUpload'
  cb(source)
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
  const source = 'runPhotoQueue'
  cb(source)
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
  const source = 'uploadPhoto'
  cb(source)
  return (dispatch, getState) => {
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    if (goodConnection) {
      dispatch(updatePhotoStatus(photoID, 'uploading'))
      UserAPI.uploadPhoto(type, photoLocation, photoID).then(() => {
        switch (type) {
          case 'horse':
            const uploadedHorseURI = horsePhotoURL(photoID)
            let horsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
            if (horsePhoto) {
              horsePhoto = horsePhoto.set('uri', uploadedHorseURI)
              dispatch(horsePhotoUpdated(horsePhoto))
              return PouchCouch.saveHorse(horsePhoto.toJS()).then((doc) => {
                const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
                dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
                return dispatch(doSync())
              })
            } else {
              return Promise.resolve()
            }
          case 'ride':
            const uploadedRideURI = ridePhotoURL(photoID)
            let ridePhoto = getState().getIn(['pouchRecords', 'ridePhotos', photoID])
            if (ridePhoto) {
              ridePhoto = ridePhoto.set('uri', uploadedRideURI)
              dispatch(ridePhotoUpdated(ridePhoto))
              return PouchCouch.saveRide(ridePhoto.toJS()).then((doc) => {
                const theRidePhotoAfterSave = getState().getIn(['pouchRecords', 'ridePhotos', photoID])
                dispatch(ridePhotoUpdated(theRidePhotoAfterSave.set('_rev', doc.rev)))
                return dispatch(doSync())
              })
            } else {
              return Promise.resolve()
            }
          case 'user':
            const uploadedUserPhotoURI = profilePhotoURL(photoID)
            let userPhoto = getState().getIn(['pouchRecords', 'userPhotos', photoID])
            if (userPhoto) {
              userPhoto = userPhoto.set('uri', uploadedUserPhotoURI)
              dispatch(userPhotoUpdated(userPhoto))
              return PouchCouch.saveUser(userPhoto.toJS()).then((doc) => {
                const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', photoID])
                dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', doc.rev)))
                return dispatch(doSync())
              })
            } else {
              return Promise.resolve()
            }
          default:
            throw Error('cant persist type I don\'t know about')
        }
      }).then(() => {
        dispatch(dequeuePhoto(photoID))
        ImagePicker.cleanSingle(photoLocation).catch(e => {
          logInfo('ImagePicker.cleanSingle error')
        })
      }).catch(e => {
        dispatch(updatePhotoStatus(photoID, 'failed'))
        catchAsyncError(dispatch)(e)
      })
    }
  }
}

export function searchForFriends (phrase) {
  const source = 'searchForFriends'
  cb(source)
  return (dispatch) => {
    UserAPI.findUser(phrase).then(resp => {
      dispatch(userSearchReturned(fromJS(resp)))
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function setFCMTokenOnServer (token) {
  const source = 'setFCMTokenOnServer'
  cb(source)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    logInfo('setting fcm token')
    UserAPI.setFCMToken(currentUserID, token, Platform.OS).then(() => {
      logInfo('FCM token set')
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function setDistributionOnServer () {
  const source = 'setDistributionOnServer'
  cb(source)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    logInfo('setting distribution')
    return UserAPI.setDistribution(currentUserID, DISTRIBUTION).then(resp => {
      if (parseInt(resp.mostRecent) > parseInt(DISTRIBUTION)) {
        const link = Platform.select({
          ios: 'https://itunes.apple.com/us/app/equesteo/id1455843114',
          android: 'market://details?id=com.equesteo',
        })
        return Linking.canOpenURL(link).then((supported) => {
          if (supported) {
            Alert.alert(
              'Old Version',
              'You\'re running an old version of Equesteo. Click here to get new features and fixes. \n\nTo never see this again, turn on auto-updates for Equesteo.',
              [
                {
                  text: 'Not Now',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => { Linking.openURL(link).catch(() => {}) },
                }
              ],
              {cancelable: true},
            )
          }
        })
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

export function signOut () {
  const source = 'signOut'
  cb(source)
  return (dispatch, getState) => {
    if (!getState().getIn(['localState', 'signingOut'])) {
      dispatch(setSigningOut(true))
      dispatch(stopLocationTracking())
      FCMTokenRefreshListenerRemover ? FCMTokenRefreshListenerRemover() : null
      firebase.iid().deleteToken('373350399276', 'GCM').catch(catchAsyncError).then(() => {
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
        dispatch(switchRoot(LOGIN))
        dispatch(clearState())
        dispatch(setSigningOut(false))
        dispatch(startForgotPWLinkListener())
      }).catch(catchAsyncError(dispatch, source))
    }
  }
}

export function showLocalNotifications () {
  const source = 'showLocalNotification'
  cb(source)
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
            }).catch(() => {})
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

export function clearLocationRetry () {
  const source = 'clearLocationRetry'
  cb(source)
  return () => {
    if (locationTrackingRetry) {
      clearTimeout(locationTrackingRetry)
    }
  }
}

let locationTrackingRetry = null
export function retryLocationTracking (inMsec) {
  const source = 'retryLocationTracking'
  cb(source)
  return (dispatch, getState) => {
    locationTrackingRetry = setTimeout(() => {
      const currentRide = getState().getIn(['currentRide', 'currentRide'])
      const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
      if (currentRide && !lastLocation) {
        dispatch(stopLocationTracking(false)).then(() => {
          dispatch(startLocationTracking())
        })
      }
    }, inMsec)
  }
}

export function gpsText(text) {
  const source = 'gpsText'
  cb(source)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    const currentUser = getState().getIn(['pouchRecords', 'users', currentUserID])
    if (!currentUser.get('disableGPSAlerts')) {
      Tts.speak(text)
    }
  }
}

export function startGPSWatcher () {
  const source = 'startGPSWatcher'
  cb(source)
  return (dispatch, getState) => {
    BackgroundTimer.runBackgroundTimer(() => {
      const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
      let timeDiff = 0
      if (lastLocation) {
        timeDiff = (unixTimeNow() / 1000) - (lastLocation.get('timestamp') / 1000)
      }
      if (timeDiff > 60) {
        if (getState().getIn(['localState', 'gpsSignalLost'])) {
          dispatch(gpsText('No gps signal.'))
        } else {
          dispatch(gpsText('GPS signal lost.'))
        }

        dispatch(gpsSignalLost(true))
      }
    }, 60000)
  }
}

export function stopGPSWatcher () {
  const source = 'stopGPSWatcher'
  cb(source)
  return () => {
    BackgroundTimer.stopBackgroundTimer();
  }
}

export function locationPermissionsError () {
  const source = 'locationPermissionsError'
  cb(source)
  return (_, getState) => {
    const recorderComponent = getState().getIn(['localState', 'activeComponent'])
    Alert.alert(
      'Uh Oh',
      'Looks like you denied location permission. \n\n This app is kind of useless without it. \n\n Allow this permission in your system settings and try again',
      [
        {
          text: 'OK',
          onPress: () => { EqNavigation.popToRoot(recorderComponent)},
        },
      ],
      {cancelable: false},
    )
  }
}


export function startLocationTracking () {
  const source = 'startLocationTracking'
  cb(source)
  return (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    const isRunning = getState().getIn(['localState', 'backgroundGeolocationRunning'])
    if (!isRunning) {
      dispatch(setBackgroundGeolocationRunning(true))
      return configureBackgroundGeolocation().then(() => {
        const KALMAN_FILTER_Q = 6
        BackgroundGeolocation.on('error', (error) => {
          if (error.code === 1000) {
            dispatch(stopLocationTracking())
            dispatch(locationPermissionsError())
          } else {
            captureException(error)
          }
        })


        BackgroundGeolocation.on('location', (location) => {
          if (Math.abs(location.time - unixTimeNow()) > 3000) {
            // Sometimes IOS feeds us old locations for the first few
            return
          }
          if (getState().getIn(['localState', 'gpsSignalLost'])) {
            dispatch(gpsText('Found GPS'))
          }
          dispatch(gpsSignalLost(false))
          if (location.accuracy > 25) {
            return
          }

          const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
          let timeDiff = 0
          if (lastLocation) {
            timeDiff = (location.time / 1000) - (lastLocation.get('timestamp') / 1000)
          }

          if (!lastLocation || timeDiff > 5) {
            const oldDistance = getState().getIn(['currentRide', 'currentRide', 'distance'])
            const refiningLocation = getState().getIn(['currentRide', 'refiningLocation'])

            let parsedLocation = Map({
              accuracy: location.accuracy,
              latitude: location.latitude,
              longitude: location.longitude,
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
              const newDistance = getState().getIn(['currentRide', 'currentRide', 'distance'])
              dispatch(doSpeech(oldDistance, newDistance))
            }
            dispatch(doHoofTracksUpload())
          }
        })

        dispatch(gpsSignalLost(false))
        dispatch(startGPSWatcher())
        BackgroundGeolocation.start()
        dispatch(retryLocationTracking(30000))
        dispatch(doSpeech())
      }).catch(catchAsyncError(dispatch, source))
    } else if (getState().getIn(['localState', 'shutdownInProgress'])) {
      dispatch(retryLocationTracking(5000))
    }
  }
}

export function doSpeech (oldDistance, newDistance) {
  const source = 'doSpeech'
  cb(source)
  return (_, getState) => {
    const newMiles = Math.floor(newDistance)
    const oldMiles = Math.floor(oldDistance)
    if (newMiles > oldMiles) {
      const currentUserID = getState().getIn(['localState', 'userID'])
      const currentUser = getState().getIn(['pouchRecords', 'users', currentUserID])
      const settingEnabled = currentUser.get('enableDistanceAlerts')
      const alertDistance = currentUser.get('alertDistance')
      if (settingEnabled && newMiles % alertDistance === 0) {
        Tts.getInitStatus().then(() => {
          Tts.speak(`You have gone ${newMiles} miles`);
        })
      }
    }
  }
}

export function doHoofTracksUpload () {
  const source = 'doHoofTracksUpload'
  cb(source)
  return (dispatch, getState) => {
    const running = getState().getIn(['localState', 'hoofTracksRunning'])
    if (running) {
      const lastUpload = getState().getIn(['currentRide', 'lastHoofTracksUpload'])
      const timeDiff = unixTimeNow() - lastUpload
      if ((!lastUpload || ((timeDiff) > 30000))) {
        const startTime = getState().getIn(['currentRide', 'currentRide', 'startTime'])
        const hoofTracksID = getState().getIn(['localState', 'hoofTracksID'])
        if (hoofTracksID) {
          const now = unixTimeNow()
          const rideCoords = getState().getIn(['currentRide', 'currentRideCoordinates', 'rideCoordinates'])
          if (rideCoords && rideCoords.count() > 0) {
            const toUpload = rideCoords.filter(rc => {
              const timestamp = rc.get(2)
              return timestamp < now && (!lastUpload || timestamp > lastUpload)
            })
            if (toUpload.count() > 0) {
              dispatch(setHoofTracksLastUpload(unixTimeNow()))
              UserAPI.uploadHoofTrackCoords(hoofTracksID, toUpload, startTime).catch(() => {
                dispatch(setHoofTracksLastUpload(lastUpload))
              })
            } else {
              dispatch(setHoofTracksLastUpload(unixTimeNow()))
              UserAPI.hoofTracksPing(hoofTracksID).catch(() => {
                dispatch(setHoofTracksLastUpload(lastUpload))
              })
            }
          }
        }
      }
    }
  }
}

export function stopHoofTracksDispatcher () {
 const source = 'stopHoofTracksDispatcher'
  cb(source)
 return (dispatch, getState) => {
   const hoofTracksID = getState().getIn(['localState', 'hoofTracksID'])
   dispatch(setHoofTracksRunning(false))
   if (hoofTracksID) {
     dispatch(setHoofTracksLastUpload(null))
     dispatch(setHoofTracksID(null))
     UserAPI.clearHoofTrackCoords(hoofTracksID).catch(catchAsyncError(dispatch, source))
   }
 }
}

export function checkNetworkConnection () {
  const source = 'checkNetworkConnection'
  cb(source)
  return (dispatch, getState) => {
    ApiClient.checkConnection().then(resp => {
      dispatch(newNetworkState(resp.connected))
      if (resp.connected) {
        dispatch(runPhotoQueue())
        const needsPersist = getState().getIn(['localState', 'needsRemotePersist']) === DB_NEEDS_SYNC
        if (needsPersist) {
          dispatch(doSync()).catch(catchAsyncError(dispatch, source))
        }
      }
    })
  }
}

let networkListenerRemover = null
export function startNetworkTracking () {
  const source = 'startNetworkTracking'
  cb(source)
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
  const source = 'startListeningFCM'
  cb(source)
  return (dispatch, getState) => {
    return firebase.messaging().requestPermission().then(() => {
      firebase.messaging().onMessage((m) => {
        const inForeground = getState().getIn(['localState', 'appState']) === 'active'
        if (isAndroid() || inForeground) {
          dispatch(doSync({}, false)).then(() => {
            dispatch(showLocalNotifications())
          }).catch(catchAsyncError(dispatch, source))
        }
      })
      firebase.notifications().onNotificationOpened(() => {
        dispatch(doSync()).catch(catchAsyncError, source)
      })
    }).catch(e => {
      if (e.code !== 'messaging/permission_error') {
        throw e
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

let FCMTokenRefreshListenerRemover = null
export function startListeningFCMTokenRefresh () {
  const source = 'startListeningFCMTokenRefresh'
  cb(source)
  return (dispatch) => {
    firebase.messaging().getToken().then(newToken => {
      if (newToken) {
        dispatch(setFCMTokenOnServer(newToken))
      }
    }).catch(catchAsyncError(dispatch, source))
    FCMTokenRefreshListenerRemover = firebase.messaging().onTokenRefresh((newToken) => {
      dispatch(setFCMTokenOnServer(newToken))
    })
  }
}

function startActiveComponentListener () {
  const source = 'startActiveComponentListener'
  cb(source)
  return (dispatch, getState) => {
    Navigation.events().registerComponentDidAppearListener( ( { componentId } ) => {
      if (componentId !== DRAWER && componentId !== RIDE_BUTTON && componentId !== NOTIFICATION_BUTTON) {
        dispatch(setActiveComponent(componentId))
      }
    })
  }
}

export function shutdownBackgroundGeolocation () {
  const source = 'shutdownBackgroundGeolocation'
  cb(source)
  return (dispatch) => {
    let numTries = 0
    function doStop () {
      logDebug('doStop')
      return new Promise(res => {
        BackgroundGeolocation.checkStatus((status) => {
          BackgroundGeolocation.removeAllListeners()
          BackgroundGeolocation.deleteAllLocations()
          if (status.isRunning) {
            BackgroundGeolocation.stop()
            ensureStop().then(() => {
              res()
            })
          } else {
            logDebug('stopped')
            dispatch(setBackgroundGeolocationRunning(false))
            res()
          }
        }, () => {
          ensureStop().then(() => {
            res()
          })
        })
      })
    }

    function ensureStop () {
      logDebug('ensureStop')
      numTries = numTries + 1
      if (numTries > 5) {
        throw new Error ('Too many tries shutting down BackgroundGeolocation')
      }
      if (numTries === 1) {
        return doStop()
      } else {
        return new Promise(res => {
          setTimeout(() => {
            doStop().then(() => {
              res()
            })
          }, 2000)
        })
      }
    }

    logDebug('shutdownBGLocation start')
    return ensureStop()
  }
}

export function stopLocationTracking (clearLast=true) {
  const source = 'stopLocationTracking'
  cb(source)
  return (dispatch) => {
    dispatch(stopGPSWatcher())
    dispatch(setShutdownInProgress(true))
    return dispatch(shutdownBackgroundGeolocation()).then(() => {
      dispatch(setShutdownInProgress(false))
      if (clearLast) {
        dispatch(clearLastLocation())
      }
    })
  }
}

function startAppStateTracking () {
  const source = 'startAppStateTracking'
  cb(source)
  return (dispatch) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
    })
  }
}

function startBackgroundFetch () {
  const source = 'startBackgroundFetch'
  cb(source)
  return (dispatch, getState) => {
    BackgroundFetch.configure({
      minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
      stopOnTerminate: false,   // <-- Android-only,
      startOnBoot: true         // <-- Android-only
    }, () => {
      const remotePersistStatus = getState().getIn(['localState', 'needsRemotePersist'])
      let before = Promise.resolve()
      let result = BackgroundFetch.FETCH_RESULT_NO_DATA
      if (remotePersistStatus === DB_NEEDS_SYNC) {
        result = BackgroundFetch.FETCH_RESULT_NEW_DATA
        before = dispatch(doSync())
      }
      before.then(() => {
        BackgroundFetch.finish(result)
      })
      before.catch(catchAsyncError(dispatch, source))
    }, (error) => {
      logError(error, "RNBackgroundFetch failed to start")
    });
  }
}

export function submitLogin (email, password) {
  const source = 'submitLogin'
  cb(source)
  return (dispatch, getState) => {
    return loginAndSync(UserAPI.login, [email, password], dispatch, getState)
  }
}

export function submitSignup (email, password) {
  const source = 'submitSignup'
  cb(source)
  return (dispatch, getState) => {
    return loginAndSync(UserAPI.signup, [email, password], dispatch, getState)
  }
}

export function pulldownSync () {
  return (dispatch) => {
    dispatch(doSync({}, true, false)).catch(catchAsyncError(dispatch, 'pulldownSync'))
  }
}

let enqueuedSync = null
export function doSync (syncData={}, showProgress=true, doUpload=true) {
  const source = 'doSync'
  cb(source)
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

    return new Promise((res, rej) => {
      if (getState().getIn(['localState', 'goodConnection'])) {
        const remotePersistStatus = getState().getIn(['localState', 'needsRemotePersist'])
        if (remotePersistStatus === DB_SYNCING) {
          // If a sync has already started, wait 10 seconds then run another one.
          // This gives time for everything (photo uploads, mostly) to settle,
          // then they can all go with one sync.
          clearTimeout(enqueuedSync)
          enqueuedSync = setTimeout(() => {
            dispatch(doSync(syncData, showProgress)).catch(catchAsyncError(dispatch, source))
            enqueuedSync = null
          }, 10000)
          return Promise.resolve()
        } else {
          dispatch(setRemotePersist(DB_SYNCING))
        }

        dispatch(clearDocsNumbers())
        dispatch(runPhotoQueue())

        dispatch(setFullSyncFail(true))
        let upload = Promise.resolve()
        if (remotePersistStatus === DB_NEEDS_SYNC || doUpload) {
          feedMessage('Uploading...', warning, null)
          upload = PouchCouch.remoteReplicateDBs()
        }
        upload.then(() => {
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
          const lastSync = getState().getIn(['localState', 'lastFullSync'])
          return PouchCouch.localReplicateDBs(userID, followingIDs, followerIDs, progress, lastSync)
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
          res()
        }).catch((e) => {
          dispatch(setFullSyncFail(true))
          dispatch(setRemotePersist(DB_NEEDS_SYNC))
          feedMessage('Error Syncing Data', danger, 5000)
          catchAsyncError(dispatch, source)(e)
          rej(e)
        })
      } else {
        dispatch(setFullSyncFail(true))
        feedMessage('Can\'t find the server.', warning, 10000)
        dispatch(checkNetworkConnection())
        rej(new NotConnectedError('sync with bad connection'))
      }
    })

  }
}


export function switchRoot (newRoot) {
  const source = 'switchRoot'
  cb(source)
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
    } else if (newRoot === NEEDS_SYNC) {
      Navigation.setRoot({
        root: {
          component: {
            name: NEEDS_SYNC,
            id: NEEDS_SYNC
          },
        }
      })
    } else {
      Navigation.setRoot({
        root: {
          sideMenu: {
            center: {
              stack: {
                children: [{
                  component: {
                    name: newRoot,
                  },
                }]
              }
            },
          }
        }
      })
    }
  }
}

export function toggleRideCarrot (rideID) {
  const source = 'toggleRideCarrot'
  cb(source)
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
        Amplitude.logEvent(GIVE_CARROT)
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
      }).catch(catchAsyncError(dispatch, source))
    }
  }
}
