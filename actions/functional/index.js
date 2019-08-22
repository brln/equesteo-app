import BackgroundFetch from "react-native-background-fetch"
import BackgroundTimer from 'react-native-background-timer'
import ImagePicker from 'react-native-image-crop-picker'
import { fromJS, Map  } from 'immutable'
import { Alert, AppState, Linking, Platform } from 'react-native'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import NetInfo from "@react-native-community/netinfo";
import PushNotification from 'react-native-push-notification'
import Tts from 'react-native-tts'
import URI from 'urijs'

import ApiClient from '../../services/ApiClient'
import config from '../../dotEnv'

import Amplitude, {
  APP_INITIALIZED,
  DUPLICATE_RIDE_TO_ANOTHER_USER,
  GIVE_CARROT
} from "../../services/Amplitude"
import TimeoutManager from '../../services/TimeoutManager'
import { captureBreadcrumb, captureException, setUserContext } from "../../services/Sentry"
import {
  goodConnection,
  horsePhotoURL,
  isAndroid,
  logError,
  logInfo,
  rideIDGenerator,
  ridePhotoURL,
  unixTimeNow,
  profilePhotoURL, haversine
} from "../../helpers"
import { danger, green, warning } from '../../colors'
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
} from '../../screens/consts/main'
import {
  EqNavigation,
  LocalStorage,
  PouchCouch,
  RidePersister,
  UserAPI
} from '../../services'
import { makeMessage } from '../../modelHelpers/notification'
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
  createRide,
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
  newNetworkState,
  notificationUpdated,
  rideAtlasEntryUpdated,
  setBackgroundGeolocationRunning,
  setShutdownInProgress,
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
  userUpdated,
  replaceLastLocation,
  newLocation,
  setGPSCoordinatesReceived,
  setAwaitingPasswordChange,
  saveUserID,
  setDoingInitialLoad, loadLocalState, loadCurrentRideState,
} from './../standard'
import {NotConnectedError, UnauthorizedError, UserAlreadyExistsError} from "../../errors"
import kalmanFilter from "../../services/Kalman"

export const DB_NEEDS_SYNC = 'DB_NEEDS_SYNC'
export const DB_SYNCING = 'DB_SYNCING'
export const DB_SYNCED = 'DB_SYNCED'

Tts.setDucking(true)

function cb(action) {
  logInfo('functionalAction: ' + action)
  captureBreadcrumb(action, 'functionalAction')
}

const functionalState = {
  enqueuedSync: null,
  FCMTokenRefreshListenerRemover: null,
  locationTrackingRetry: null,
  networkListenerRemover: null,
  pwlinkListener: null,
  feedMessageTimeout: null,
}

export function catchAsyncError (dispatch, source) {
  return (e) => {
    if (!(e instanceof NotConnectedError)) {
      if (e && e.status === 401) {
        dispatch(functional.signOut())
      }
      captureBreadcrumb(source)
      captureException(e)
      if (config.ENV === 'local') {
        Alert.alert('Async error, check logs')
        logError(e, 'catchAsyncError')
      }
    }
  }
}

function addHorseUser (horse, user) {
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
    dispatch(functional.persistHorseUser(id))
  }
}

function startForgotPWLinkListener () {
  return (dispatch, getState) => {
    functionalState.pwLinkListener = ({ url }) => {
      const parsedURL = URI(url)
      const token = parsedURL.search(true).t
      const email = atob(parsedURL.search(true).e)
      if (email && token) {
        console.log(email)
        console.log(token)
        dispatch(functional.exchangePWCode(email, token)).then(() => {
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
    Linking.addEventListener('url', functionalState.pwLinkListener)
  }
}

function removeForgotPWLinkListener () {
  return () => {
    if (functionalState.pwLinkListener) {
      Linking.removeEventListener('url', functionalState.pwLinkListener)
    }
  }
}

function appInitialized () {
  const source = 'appInitialized'
  cb(source)
  return (dispatch, getState) => {
    let postSync = () => {}
    dispatch(functional.tryToLoadStateFromDisk()).then(() => {
      dispatch(functional.startActiveComponentListener())
      dispatch(dismissError())
      dispatch(functional.startAppStateTracking())

      // Just in case app died, this will clear the notification
      // just by opening app, so it's not stuck up there. Need to
      // not clear last so if app died and the continue current ride,
      // will keep working.
      dispatch(functional.stopLocationTracking(false))
      return ApiClient.getToken()
    }).then((token) => {
      const currentUserID = getState().getIn(['localState', 'userID'])
      if (token && currentUserID) {
        setUserContext(currentUserID)
        Amplitude.setUserID(currentUserID)
        return PouchCouch.localLoad().then((localData) => {
          dispatch(localDataLoaded(localData))
          dispatch(functional.startListeningFCMTokenRefresh())
          dispatch(functional.startListeningFCM())
          if (getState().getIn(['localState', 'lastFullSync'])) {
            Amplitude.logEvent(APP_INITIALIZED)
            dispatch(functional.switchRoot(FEED))
          } else {
            dispatch(functional.switchRoot(NEEDS_SYNC))
            postSync = () => {
              dispatch(functional.switchRoot(FEED))
            }
          }
          return dispatch(functional.startNetworkTracking())
        }).then(() => {
          return dispatch(functional.doSync({}, true, false)).then(postSync).catch(catchAsyncError(dispatch, source))
        }).then(() => {
          dispatch(functional.startBackgroundFetch())
        }).then(() => {
          // setDistribution needs to be far apart from FCMToken or they
          // end up in a race condition on the server. really, need to
          // consolidate the two calls.
          return dispatch(functional.setDistributionOnServer())
        })
      } else {
        if (getState().getIn(['localState', 'everLoggedIn'])) {
          dispatch(functional.switchRoot(LOGIN))
        } else {
          dispatch(functional.switchRoot(SIGNUP))
        }
        dispatch(functional.startForgotPWLinkListener())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function changeHorseOwner (horse, newOwnerID) {
  const source = 'addHorseUser'
  cb(source)
  return (dispatch, getState) => {
    let oldOwnerHorseUser = getState().getIn(['pouchRecords', 'horseUsers']).filter(hu => {
      return hu.get('horseID') === horse.get('_id') && hu.get('owner') === true
    }).first()
    oldOwnerHorseUser = oldOwnerHorseUser.set('owner', false).set('deleted', true)
    dispatch(horseUserUpdated(oldOwnerHorseUser))
    dispatch(functional.persistHorseUser(oldOwnerHorseUser.get('_id', false)))

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
    dispatch(functional.persistHorseUser(id))
  }
}

function clearRideNotifications (rideID) {
  const source = 'clearRideNotifications'
  cb(source)
  return (dispatch, getState) => {
    const unseenNotifications = getState().getIn(['pouchRecords', 'notifications']).valueSeq().filter(n => {
      return n.get('seen') !== true && n.get('rideID') === rideID
    }).toList()
    const ids = unseenNotifications.map(n => n.get('_id'))
    dispatch(functional.markNotificationsSeen(ids))
  }
}

function createCareEvent () {
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
        return dispatch(functional.doSync())
      }).catch(catchAsyncError(dispatch, source))
    })
  }
}

function createRideAtlasEntry(name, userID, ride, rideCoordinates, rideElevations) {
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
      dispatch(functional.doSync()).catch(catchAsyncError(dispatch, source))
    }).catch(catchAsyncError(dispatch, source))
  }
}

function createRideComment(commentData) {
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
      return dispatch(functional.doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

function deleteCareEvent (careEvent) {
  const source = 'deleteCareEvent'
  cb(source)
  return (dispatch, getState) => {
    const deleted = careEvent.set('deleted', true)
    dispatch(careEventUpdated(deleted))
    PouchCouch.saveHorse(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'careEvents', careEvent.get('_id')])
      dispatch(careEventUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(functional.doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

function duplicateRide (userID, ride, rideElevations, rideCoordinates) {
  const source = 'duplicateRide'
  cb(source)
  return (dispatch, getState) => {
    Amplitude.logEvent(DUPLICATE_RIDE_TO_ANOTHER_USER)
    const rideID = rideIDGenerator(userID)
    dispatch(createRide(
      rideID,
      userID,
      ride,
      rideElevations,
      rideCoordinates,
      ride.get('_id'),
      true
    ))
    const newCoordinates = getState().getIn(['pouchRecords', 'selectedRideCoordinates'])
    const newElevations = getState().getIn(['pouchRecords', 'selectedRideElevations'])
    return dispatch(functional.persistRide(
      rideID,
      true,
      newCoordinates,
      newElevations,
    )).then(() => {
      return dispatch(functional.doSync())
    })
  }
}

function deleteHorseUser (horseUserID) {
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

function deleteRideAtlasEntry (entryID) {
  const source = 'deleteRideAtlasEntry'
  cb(source)
  return (dispatch, getState) => {
    const theRideAtlasEntry = getState().getIn (['pouchRecords', 'rideAtlasEntries', entryID])
    const deleted = theRideAtlasEntry.set('deleted', true)
    dispatch(rideAtlasEntryUpdated(deleted))
    return PouchCouch.saveRide(deleted.toJS()).then(doc => {
      const afterSave = getState().getIn(['pouchRecords', 'rideAtlasEntries', entryID])
      dispatch(rideAtlasEntryUpdated(afterSave.set('_rev', doc.rev)))
      return dispatch(functional.doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

function exchangePWCode (email, code) {
  const source = 'exchangePWCode'
  cb(source)
  return () => {
    return UserAPI.exchangePWCodeForToken(email, code)
  }
}

function getPWCode (email) {
  const source = 'getPWCode'
  cb(source)
  return (dispatch) => {
    return UserAPI.getPWCode(email).catch(e => {
      dispatch(errorOccurred(e.message))
    })
  }
}

function loadRideCoordinates (rideID) {
  const source = 'loadRideCoordinates'
  cb(source)
  return (dispatch) => {
    return PouchCouch.loadRideCoordinates(rideID).then((coords) => {
      dispatch(rideCoordinatesLoaded(coords))
    }).catch(catchAsyncError(dispatch, source))
  }
}

function loadRideElevations (rideID) {
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

function loadSingleRide (rideID) {
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

function markNotificationsSeen (notificationIDs) {
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
      return dispatch(functional.doSync({}, false))
    }).catch(catchAsyncError(dispatch, source))
  }
}

function markNotificationPopped (notification) {
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

function newPassword (password) {
  const source = 'newPassword'
  cb(source)
  return (dispatch) => {
    return dispatch(functional.loginAndSync(UserAPI.changePassword, [password]))
  }
}

function persistFollow (followID, creating) {
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
      return dispatch(functional.doSync())
    }).catch(catchAsyncError(dispatch, source))
  }
}

function persistRide (rideID, newRide, rideCoordinates, rideElevations, stashedPhotos=Map(), deletedPhotoIDs=Map(), rideHorses=Map()) {
  const source = 'persistRide'
  cb(source)
  return (dispatch, getState) => {
    const ridePersister = new RidePersister(dispatch, getState, rideID, PouchCouch)
    return ridePersister.persistRide(newRide, rideCoordinates, rideElevations, stashedPhotos, deletedPhotoIDs, rideHorses)
  }
}

function persistUserWithPhoto (userID, userPhotoID, doSyncNow) {
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
      dispatch(functional.photoNeedsUpload('user', theUserPhoto.get('uri'), userPhotoID))
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
        return dispatch(functional.doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function persistHorseWithPhoto (horseID, horsePhotoID, doSyncNow) {
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
      dispatch(functional.photoNeedsUpload('horse', theHorsePhoto.get('uri'), horsePhotoID))
      const theHorse = getState().getIn(['pouchRecords', 'horses', horseID])
      if (!theHorse) {
        throw new Error('no horse with that ID')
      }
      return PouchCouch.saveHorse(theHorse.toJS())
    }).then((doc) => {
      const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
      dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
      if (doSyncNow) {
        return dispatch(functional.doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function persistHorseUpdate (horseID, horseUserID, deletedPhotoIDs, newPhotoIDs, previousDefaultValue, doSyncNow) {
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
            dispatch(functional.photoNeedsUpload('horse', photoLocation, photoID))
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
        return dispatch(functional.doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function persistHorseUser (horseUserID, runSyncNow=true) {
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
        return dispatch(functional.doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function persistUserUpdate (userID, deletedPhotoIDs, doSyncNow) {
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
        return dispatch(functional.doSync())
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function photoNeedsUpload (type, photoLocation, photoID) {
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
    dispatch(functional.runPhotoQueue())
  }
}

function runPhotoQueue() {
  const source = 'runPhotoQueue'
  cb(source)
  return (dispatch, getState) => {
    getState().getIn(['localState', 'photoQueue']).forEach((p) => {
      if (p.get('status') === 'enqueued'
        || p.get('status') === 'failed'
        || p.get('status') === 'uploading' && unixTimeNow() - p.get('timestamp') > 60000) {
        dispatch(functional.uploadPhoto(
          p.get('type'),
          p.get('photoLocation'),
          p.get('photoID'),
        ))
      }
    })
  }
}

function uploadPhoto (type, photoLocation, photoID) {
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
                return dispatch(functional.doSync())
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
                return dispatch(functional.doSync())
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
                return dispatch(functional.doSync())
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

function searchForFriends (phrase) {
  const source = 'searchForFriends'
  cb(source)
  return (dispatch) => {
    UserAPI.findUser(phrase).then(resp => {
      dispatch(userSearchReturned(fromJS(resp)))
    }).catch(catchAsyncError(dispatch, source))
  }
}

function setFCMTokenOnServer (token) {
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

function setDistributionOnServer () {
  const source = 'setDistributionOnServer'
  cb(source)
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    logInfo('setting distribution')
    return UserAPI.setDistribution(currentUserID, config.DISTRIBUTION).then(resp => {
      if (parseInt(resp.mostRecent) > parseInt(config.DISTRIBUTION)) {
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

function signOut () {
  const source = 'signOut'
  cb(source)
  return (dispatch, getState) => {
    if (!getState().getIn(['localState', 'signingOut'])) {
      dispatch(setSigningOut(true))
      dispatch(functional.stopLocationTracking())
      functionalState.FCMTokenRefreshListenerRemover ? functionalState.FCMTokenRefreshListenerRemover() : null
      dispatch(functional.stopBackgroundFetch())
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
        dispatch(functional.switchRoot(LOGIN))
        dispatch(clearState())
        dispatch(setSigningOut(false))
        dispatch(functional.startForgotPWLinkListener())
      }).catch(catchAsyncError(dispatch, source))
    }
  }
}

function showLocalNotifications () {
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
          dispatch(functional.markNotificationsSeen([notification.get('_id')]))

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
      dispatch(functional.markNotificationPopped(notification))
    }
  }
}

function clearLocationRetry () {
  const source = 'clearLocationRetry'
  cb(source)
  return () => {
    if (functionalState.locationTrackingRetry) {
      TimeoutManager.deleteTimeout(functionalState.locationTrackingRetry)
    }
  }
}

function retryLocationTracking (inMsec) {
  const source = 'retryLocationTracking'
  cb(source)
  return (dispatch, getState) => {
    functionalState.locationTrackingRetry = TimeoutManager.newTimeout(() => {
      const currentRide = getState().getIn(['currentRide', 'currentRide'])
      const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
      if (currentRide && !lastLocation) {
        dispatch(functional.stopLocationTracking(false)).then(() => {
          dispatch(functional.startLocationTracking())
        })
      }
    }, inMsec)
  }
}

function gpsText(text) {
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

function startGPSWatcher () {
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
          dispatch(functional.gpsText('No gps signal.'))
        } else {
          dispatch(functional.gpsText('GPS signal lost.'))
        }

        dispatch(gpsSignalLost(true))
      }
    }, 60000)
  }
}

function stopGPSWatcher () {
  const source = 'stopGPSWatcher'
  cb(source)
  return () => {
    BackgroundTimer.stopBackgroundTimer();
  }
}

function locationPermissionsError () {
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


function startLocationTracking () {
  const source = 'startLocationTracking'
  cb(source)
  return (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    const isRunning = getState().getIn(['localState', 'backgroundGeolocationRunning'])
    if (!isRunning) {
      dispatch(setBackgroundGeolocationRunning(true))
      return dispatch(functional.configureBackgroundGeolocation()).then(() => {
        BackgroundGeolocation.on('error', error => {
          dispatch(functional.gpsLocationError(error))
        })


        BackgroundGeolocation.on('location', location => {
          dispatch(functional.onGPSLocation(location))
        })

        dispatch(gpsSignalLost(false))
        dispatch(startGPSWatcher())
        BackgroundGeolocation.start()
        dispatch(functional.retryLocationTracking(30000))
        dispatch(functional.doSpeech())
      }).catch(catchAsyncError(dispatch, source))
    } else if (getState().getIn(['localState', 'shutdownInProgress'])) {
      dispatch(functional.retryLocationTracking(5000))
    }
  }
}

export function gpsLocationError (error) {
  const source = 'gpsLocationError'
  cb(source)
  return (dispatch) => {
    if (error.code === 1000) {
      return dispatch(functional.stopLocationTracking()).then(() => {
        dispatch(functional.locationPermissionsError())
      })
    } else if (error.code === 1003) {
      logInfo(error, 'gpsLocationError1003')
    } else {
      captureException(error)
    }
  }
}

function onGPSLocation (location) {
  const KALMAN_FILTER_Q = 6
  const THROWAWAY_FIRST_N_COORDS = 3
  const MINIMUM_ACCURACY_IN_M = 25

  return (dispatch, getState) => {
    const alreadyReceived = getState().getIn(['localState', 'gpsCoordinatesReceived'])
    const nowReceived = alreadyReceived + 1
    dispatch(setGPSCoordinatesReceived(nowReceived))
    if (nowReceived <= THROWAWAY_FIRST_N_COORDS || location.accuracy > MINIMUM_ACCURACY_IN_M) {
      return
    }

    if (getState().getIn(['localState', 'gpsSignalLost'])) {
      dispatch(functional.gpsText('Found GPS'))
    }
    dispatch(gpsSignalLost(false))

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
        dispatch(functional.doSpeech(oldDistance, newDistance))
      }
      dispatch(functional.doHoofTracksUpload())
    }
  }
}

export function tryToLoadStateFromDisk () {
  return (dispatch) => {
    return Promise.all([
      LocalStorage.loadLocalState(),
      LocalStorage.loadCurrentRideState()
    ]).then(([localState, currentRideState]) => {
      if (localState) {
        dispatch(loadLocalState(localState))
      } else {
        logInfo('no cached local state found')
      }

      if (currentRideState) {
        logInfo('current ride state loaded')
        dispatch(loadCurrentRideState(currentRideState))
      } else {
        logInfo('no cached current ride state found')
      }
    }).catch(catchAsyncError(dispatch, 'tryToLoadStateFromDisk'))
  }
}

function loginAndSync(loginFunc, loginArgs) {
  return (dispatch, getState) => {
    return loginFunc(...loginArgs).then(resp => {
      const userID = resp.id
      const followingIDs = resp.following
      const followerIDs = resp.followers

      dispatch(dismissError())
      dispatch(setAwaitingPasswordChange(true))
      dispatch(saveUserID(userID))
      setUserContext(userID)
      Amplitude.setUserID(userID)
      dispatch(functional.startListeningFCMTokenRefresh())
      dispatch(setDoingInitialLoad(true))
      return dispatch(functional.doSync({userID, followingIDs, followerIDs})).catch(catchAsyncError(dispatch))
    }).then(() => {
      // setDistribution needs to be far apart from FCMToken or they
      // end up in a race condition on the server. really, need to
      // consolidate the two calls.
      dispatch(functional.setDistributionOnServer())
      const syncFail = getState().getIn(['localState', 'fullSyncFail'])
      if (!syncFail) {
        TimeoutManager.newTimeout(() => {
          dispatch(functional.switchRoot(FEED))
          dispatch(functional.startListeningFCM())
        }, 100)

      } else {
        dispatch(functional.switchRoot(NEEDS_SYNC))
      }
      dispatch(functional.removeForgotPWLinkListener())
    }).catch(e => {
      dispatch(errorOccurred(e.message))
      if (!(e instanceof UnauthorizedError) && !(e instanceof UserAlreadyExistsError)) {
        catchAsyncError(dispatch, 'loginAndSync')(e)
      }
    })
  }
}

function configureBackgroundGeolocation () {
  return () => {
    return new Promise((res, rej) => {
      BackgroundGeolocation.configure(
        {
          desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
          locationProvider: BackgroundGeolocation.RAW_PROVIDER,
          distanceFilter: 0,
          maxLocations: 10,
          interval: 0,
          notificationTitle: 'You\'re out on a ride.',
          notificationText: 'Tap here to see your progress.',
        },
        () => {
          logInfo('Background geolocation configured')
          res()
        },
        (e) => {
          rej(e)
        },
      )
    })
  }
}

function doSpeech (oldDistance, newDistance) {
const source = 'doSpeech'
return (_, getState) => {
  const newMiles = Math.floor(newDistance)
  const oldMiles = Math.floor(oldDistance)
  if (newMiles > oldMiles) {
    const currentUserID = getState().getIn(['localState', 'userID'])
    const currentUser = getState().getIn(['pouchRecords', 'users', currentUserID])
    const settingEnabled = currentUser.get('enableDistanceAlerts')
    const alertDistance = currentUser.get('alertDistance')
    if (settingEnabled && newMiles % alertDistance === 0) {
      cb(source)
      Tts.getInitStatus().then(() => {
        Tts.speak(`You have gone ${newMiles} miles`);
      })
    }
  }
}
}

function doHoofTracksUpload () {
  const source = 'doHoofTracksUpload'
  return (dispatch, getState) => {
    const running = getState().getIn(['localState', 'hoofTracksRunning'])
    if (running) {
      cb(source)
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

function stopHoofTracksDispatcher () {
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

function checkNetworkConnection () {
const source = 'checkNetworkConnection'
cb(source)
return (dispatch, getState) => {
  ApiClient.checkConnection().then(resp => {
    dispatch(newNetworkState(resp.connected))
    if (resp.connected) {
      dispatch(functional.runPhotoQueue())
      const needsPersist = getState().getIn(['localState', 'needsRemotePersist']) === DB_NEEDS_SYNC
      if (needsPersist) {
        dispatch(functional.doSync()).catch(catchAsyncError(dispatch, source))
      }
    }
  })
}
}

function startNetworkTracking () {
const source = 'startNetworkTracking'
cb(source)
return (dispatch) => {
  if (functionalState.networkListenerRemover) {
    functionalState.networkListenerRemover()
    }

    const listener = () => {
      TimeoutManager.newTimeout(() => {
        dispatch(functional.checkNetworkConnection())
      }, 2000)
    }

    functionalState.networkListenerRemover = NetInfo.addEventListener(listener)
    listener()
  }
}

function startListeningFCM () {
  const source = 'startListeningFCM'
  cb(source)
  return (dispatch, getState) => {
    return firebase.messaging().requestPermission().then(() => {
      firebase.messaging().onMessage((m) => {
        const inForeground = getState().getIn(['localState', 'appState']) === 'active'
        if (isAndroid() || inForeground) {
          dispatch(functional.doSync({}, false)).then(() => {
            dispatch(functional.showLocalNotifications())
          }).catch(catchAsyncError(dispatch, source))
        }
      })
      firebase.notifications().onNotificationOpened(() => {
        dispatch(functional.doSync()).catch(catchAsyncError, source)
      })
    }).catch(e => {
      if (e.code !== 'messaging/permission_error') {
        throw e
      }
    }).catch(catchAsyncError(dispatch, source))
  }
}

function startListeningFCMTokenRefresh () {
  const source = 'startListeningFCMTokenRefresh'
  cb(source)
  return (dispatch) => {
    firebase.messaging().getToken().then(newToken => {
      if (newToken) {
        dispatch(functional.setFCMTokenOnServer(newToken))
      }
    }).catch(catchAsyncError(dispatch, source))
    functionalState.FCMTokenRefreshListenerRemover = firebase.messaging().onTokenRefresh((newToken) => {
      dispatch(functional.setFCMTokenOnServer(newToken))
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

function shutdownBackgroundGeolocation () {
  const source = 'shutdownBackgroundGeolocation'
  cb(source)
  return (dispatch) => {
    let numTries = 0
    function doStop () {
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
      numTries = numTries + 1
      if (numTries > 5) {
        throw new Error ('Too many tries shutting down BackgroundGeolocation')
      }
      if (numTries === 1) {
        return doStop()
      } else {
        return new Promise(res => {
          TimeoutManager.newTimeout(() => {
            doStop().then(() => {
              res()
            })
          }, 2000)
        })
      }
    }

    return ensureStop()
  }
}

function stopLocationTracking (clearLast=true) {
  const source = 'stopLocationTracking'
  cb(source)
  return (dispatch) => {
    dispatch(functional.stopGPSWatcher())
    dispatch(setShutdownInProgress(true))
    return dispatch(functional.shutdownBackgroundGeolocation()).then(() => {
      dispatch(setGPSCoordinatesReceived(0))
      dispatch(setShutdownInProgress(false))
      if (clearLast) {
        dispatch(clearLastLocation())
      }
    }).catch(catchAsyncError(dispatch, source))
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
      startOnBoot: false         // <-- Android-only
    }, () => {
      const remotePersistStatus = getState().getIn(['localState', 'needsRemotePersist'])
      let before = Promise.resolve()
      let result = BackgroundFetch.FETCH_RESULT_NO_DATA
      if (remotePersistStatus === DB_NEEDS_SYNC) {
        result = BackgroundFetch.FETCH_RESULT_NEW_DATA
        before = dispatch(functional.doSync())
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

function stopBackgroundFetch () {
  const source = 'stopBackgroundFetch'
  cb(source)
  return () => {
    BackgroundFetch.stop()
  }
}

function submitLogin (email, password) {
  const source = 'submitLogin'
  cb(source)
  return (dispatch) => {
    return dispatch(functional.loginAndSync(UserAPI.login, [email, password]))
  }
}

function submitSignup (email, password) {
  const source = 'submitSignup'
  cb(source)
  return (dispatch) => {
    return dispatch(functional.loginAndSync(UserAPI.signup, [email, password]))
  }
}

function pulldownSync () {
  return (dispatch) => {
    dispatch(functional.doSync({}, true, false)).catch(catchAsyncError(dispatch, 'pulldownSync'))
  }
}

function doSync (syncData={}, showProgress=true, doUpload=true) {
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
          if (functionalState.feedMessageTimeout) {
            TimeoutManager.deleteTimeout(functionalState.feedMessageTimeout)
          }
          functionalState.feedMessageTimeout = TimeoutManager.newTimeout(() => {
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
          return Promise.resolve()
        } else {
          dispatch(setRemotePersist(DB_SYNCING))
        }

        dispatch(clearDocsNumbers())
        dispatch(functional.runPhotoQueue())

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
        dispatch(functional.checkNetworkConnection())
        rej(new NotConnectedError('sync with bad connection'))
      }
    })
  }
}

function switchRoot (newRoot) {
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

function toggleRideCarrot (rideID) {
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
        return dispatch(functional.doSync({}, false))
      }).catch(catchAsyncError(dispatch, source))
    }
  }
}

// This method of exporting allows us to mock individual functional actions
// while testing some other functional action from this same module.
const functional = {
  addHorseUser,
  appInitialized,
  changeHorseOwner,
  checkNetworkConnection,
  clearLocationRetry,
  clearRideNotifications,
  configureBackgroundGeolocation,
  createCareEvent,
  createRideAtlasEntry,
  createRideComment,
  deleteCareEvent,
  deleteHorseUser,
  deleteRideAtlasEntry,
  doHoofTracksUpload,
  doSpeech,
  doSync,
  duplicateRide,
  exchangePWCode,
  getPWCode,
  gpsLocationError,
  gpsText,
  loadRideCoordinates,
  loadRideElevations,
  loadSingleRide,
  locationPermissionsError,
  loginAndSync,
  markNotificationPopped,
  markNotificationsSeen,
  newPassword,
  onGPSLocation,
  persistFollow,
  persistHorseUpdate,
  persistHorseUser,
  persistHorseWithPhoto,
  persistRide,
  persistUserUpdate,
  persistUserWithPhoto,
  photoNeedsUpload,
  pulldownSync,
  removeForgotPWLinkListener,
  retryLocationTracking,
  runPhotoQueue,
  searchForFriends,
  setDistributionOnServer,
  setFCMTokenOnServer,
  showLocalNotifications,
  shutdownBackgroundGeolocation,
  signOut,
  startActiveComponentListener,
  startAppStateTracking,
  startBackgroundFetch,
  startForgotPWLinkListener,
  startGPSWatcher,
  startListeningFCM,
  startListeningFCMTokenRefresh,
  startLocationTracking,
  startNetworkTracking,
  stopBackgroundFetch,
  stopGPSWatcher,
  stopHoofTracksDispatcher,
  stopLocationTracking,
  submitLogin,
  submitSignup,
  switchRoot,
  tryToLoadStateFromDisk,
  toggleRideCarrot,
  uploadPhoto,
}
export default functional
