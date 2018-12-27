import ImagePicker from 'react-native-image-crop-picker'
import { fromJS, Map  } from 'immutable'
import { AppState, NetInfo } from 'react-native'
import { DISTRIBUTION } from 'react-native-dotenv'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import { ENV } from 'react-native-dotenv'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'

import ApiClient from '../services/ApiClient'
import kalmanFilter from '../services/Kalman'
import { captureException, setUserContext } from "../services/Sentry"
import { handleNotification } from '../services/PushNotificationHandler'

import {
  goodConnection,
  haversine,
  horsePhotoURL,
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
  stopListeningFCM,
  tryToLoadStateFromDisk
} from './helpers'
import { appStates } from '../helpers'
import { CAMERA, DRAWER, FEED, RECORDER, SIGNUP_LOGIN, UPDATE_NEW_RIDE_ID } from '../screens'
import { LocalStorage, PouchCouch, RidePersister, UserAPI } from '../services'

const DB_NEEDS_SYNC = 'DB_NEEDS_SYNC'
const DB_SYNCING = 'DB_SYNCING'
const DB_SYNCED = 'DB_SYNCED'

import {
  awaitFullSync,
  clearLastLocation,
  clearFeedMessage,
  clearState,
  deleteUnpersistedPhoto,
  dequeuePhoto,
  dismissError,
  enqueuePhoto,
  errorOccurred,
  horsePhotoUpdated,
  horseUpdated,
  followUpdated,
  horseUserUpdated,
  localDataLoaded,
  newAppState,
  newLocation,
  newNetworkState,
  replaceLastLocation,
  rideCoordinatesLoaded,
  rideCarrotCreated,
  rideCarrotSaved,
  rideCommentUpdated,
  rideElevationsLoaded,
  ridePhotoUpdated,
  setPopShowRide,
  setRemotePersistDB,
  setFeedMessage,
  setFullSyncFail,
  setSigningOut,
  showPopShowRide,
  setActiveComponent,
  syncComplete,
  updatePhotoStatus,
  userPhotoUpdated,
  userSearchReturned,
  userUpdated,
} from './standard'

export function catchAsyncError (dispatch) {
  return (e) => {
    if (e.status === 401) {
      dispatch(signOut())
    }
    logError(e)
    captureException(e)
  }
}


export function addHorseUser (horse, user) {
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
  return (dispatch, getState) => {
    tryToLoadStateFromDisk(dispatch).then(() => {
      dispatch(startActiveComponentListener())
      dispatch(dismissError())
      dispatch(checkFCMPermission())
      dispatch(startNetworkTracking())
      dispatch(startAppStateTracking())
      return ApiClient.getToken()
    }).then((token) => {
      if (token) {
        const currentUserID = getState().getIn(['localState', 'userID'])
        setUserContext(currentUserID)
        return PouchCouch.localLoad().then((localData) => {
          dispatch(localDataLoaded(localData))
          dispatch(startListeningFCMTokenRefresh())
          dispatch(startListeningFCM())
          dispatch(setDistributionOnServer())
          dispatch(syncDBPull('all'))
          dispatch(switchRoot(FEED))
        })
      } else {
        dispatch(switchRoot(SIGNUP_LOGIN))
      }
    }).catch(catchAsyncError(dispatch))
  }
}

export function checkFCMPermission () {
  return () => {
    firebase.messaging().hasPermission().then(enabled => {
      if (!enabled) {
        return firebase.messaging().requestPermission().then((resp) => {
          if (!resp) {
            alert('FCM permission must be enabled.')
          }
        })
      }
    }).catch(e => {
      logError(e)
    })
  }
}

export function createRideComment(commentData) {
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
      dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError(dispatch))

  }
}

export function deleteHorseUser (horseUserID) {
  return (dispatch, getState) => {
    let theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw Error('Could not find horseUser')
    }
    theHorseUser = theHorseUser.set('deleted', true)
    dispatch(horseUserUpdated(theHorseUser))
  }
}

export function exchangePWCode (email, code) {
  return (dispatch) => {
    loginAndSync(UserAPI.exchangePWCodeForToken, [email, code], dispatch)
  }
}

export function getPWCode (email) {
  return (dispatch, getState) => {
    UserAPI.getPWCode(email).catch(e => {
      dispatch(errorOccurred(e.message))
    })
  }
}

export function loadRideCoordinates (rideID) {
  return (dispatch) => {
    PouchCouch.loadRideCoordinates(rideID).then((coords) => {
      dispatch(rideCoordinatesLoaded(coords))
    }).catch(catchAsyncError(dispatch))
  }
}

export function loadRideElevations (rideID) {
  return (dispatch) => {
    PouchCouch.loadRideElevations(rideID).then((elevations) => {
      dispatch(rideElevationsLoaded(elevations))
    }).catch(catchAsyncError(dispatch))
  }
}

export function newPassword (password) {
  return (dispatch, getState) => {
    UserAPI.changePassword(password).then(() => {
      dispatch(switchRoot(FEED))
    }).catch(catchAsyncError(dispatch))
  }
}

export function doRemotePersist(db) {
  return (dispatch, getState) => {
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    if (goodConnection) {
      dispatch(remotePersistStarted(db))
      PouchCouch.remoteReplicateDB(db).then(() => {
        dispatch(remotePersistComplete(db))
      }).catch((e) => {
        catchAsyncError(dispatch)(e)
        dispatch(remotePersistError(db))
      })
    }
  }
}

export function needsRemotePersist(db) {
  return (dispatch) => {
    dispatch(setFeedMessage(Map({
      message: 'Data Needs to Upload',
      color: warning,
    })))
    dispatch(setRemotePersistDB(db, DB_NEEDS_SYNC))
    dispatch(doRemotePersist(db))
  }
}

export function persistFollow (followID) {
  return (dispatch, getState) => {
    const theFollow = getState().getIn(['pouchRecords', 'follows', followID])
    if (!theFollow) {
      throw new Error('no follow with that ID')
    }

    PouchCouch.saveUser(theFollow.toJS()).then(({ rev }) => {
      let foundAfterSave = getState().getIn(['pouchRecords', 'follows', followID])
      dispatch(followUpdated(foundAfterSave.set('_rev', rev)))
      dispatch(needsRemotePersist('users'))
      dispatch(syncDBPull())
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistRide (rideID, newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
  return (dispatch, getState) => {
    const ridePersister = new RidePersister(dispatch, getState, rideID)
    ridePersister.persistRide(newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses)
  }
}

export function persistUserWithPhoto (userID, userPhotoID) {
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
      dispatch(needsRemotePersist('users'))
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseWithPhoto (horseID, horsePhotoID) {
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
      dispatch(needsRemotePersist('horses'))
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseUpdate (horseID, horseUserID, deletedPhotoIDs, newPhotoIDs, previousDefaultValue) {
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
      dispatch(needsRemotePersist('horses'))
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistHorseUser (horseUserID) {
  return (dispatch, getState) => {
    const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw new Error('no horse user with that ID')
    }
    PouchCouch.saveHorse(theHorseUser.toJS()).then(({ rev }) => {
      const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
      dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', rev)))
      dispatch(needsRemotePersist('horses'))
    }).catch(catchAsyncError(dispatch))
  }
}

export function persistUserUpdate (userID, deletedPhotoIDs) {
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
      dispatch(needsRemotePersist('users'))
    }).catch(catchAsyncError(dispatch))
  }
}

export function photoNeedsUpload (type, photoLocation, photoID) {
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
  return (dispatch, getState) => {
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    if (goodConnection) {
      dispatch(updatePhotoStatus(photoID, 'uploading'))
      logDebug(`uploading ${type} photo`)
      UserAPI.uploadPhoto(type, photoLocation, photoID).then(() => {
        logDebug(`uploading ${type} photo complete`)
        switch (type) {
          case 'horse':
            const uploadedHorseURI = horsePhotoURL(photoID)
            const horsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID]).set('uri', uploadedHorseURI)
            dispatch(horsePhotoUpdated(horsePhoto))
            return PouchCouch.saveHorse(horsePhoto.toJS()).then((doc) => {
              const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
              dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('horses'))
            })
          case 'ride':
            const uploadedRideURI = ridePhotoURL(photoID)
            const ridePhoto = getState().getIn(['pouchRecords', 'ridePhotos', photoID]).set('uri', uploadedRideURI)
            dispatch(ridePhotoUpdated(ridePhoto))
            return PouchCouch.saveRide(ridePhoto.toJS()).then((doc) => {
              const theRidePhotoAfterSave = getState().getIn(['pouchRecords', 'ridePhotos', photoID])
              dispatch(ridePhotoUpdated(theRidePhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('rides'))
            })
          case 'user':
            const uploadedUserPhotoURI = profilePhotoURL(photoID)
            const userPhoto = getState().getIn(['pouchRecords', 'userPhotos', photoID]).set('uri', uploadedUserPhotoURI)
            dispatch(userPhotoUpdated(userPhoto))
            return PouchCouch.saveUser(userPhoto.toJS()).then((doc) => {
              const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', photoID])
              dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('users'))
            })
          default:
            throw Error('cant persist type I don\'t know about')
        }
      }).then(() => {
        dispatch(dequeuePhoto(photoID))
        return ImagePicker.cleanSingle(photoLocation)
      }).catch(e => {
        logError(e)
        dispatch(updatePhotoStatus(photoID, 'failed'))
      })
    }
  }
}

export function remotePersistComplete (db) {
  return (dispatch) => {
    dispatch(setRemotePersistDB(db, DB_SYNCED))
    dispatch(setFeedMessage(Map({
      message: 'All Data Uploaded',
      color: green,
    })))
    setTimeout(() => {
      dispatch(clearFeedMessage())
    }, 3000)
  }
}

export function remotePersistError (db) {
  return (dispatch) => {
    dispatch(setRemotePersistDB(db, DB_NEEDS_SYNC))
    dispatch(setFeedMessage(Map({
      message: 'Can\'t Upload Data',
      color: danger,
    })))
  }
}

export function remotePersistStarted (db) {
  return (dispatch) => {
    dispatch(setRemotePersistDB(db, DB_SYNCING))
    dispatch(setFeedMessage(Map({
      message: 'Data Uploading',
      color: warning,
    })))
  }
}

export function searchForFriends (phrase) {
  return (dispatch) => {
    UserAPI.findUser(phrase).then(resp => {
      dispatch(userSearchReturned(fromJS(resp)))
    }).catch(catchAsyncError(dispatch))
  }
}

export function setFCMTokenOnServer (token) {
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    UserAPI.setFCMToken(currentUserID, token).then(() => {
      logInfo('FCM token set')
    }).catch(catchAsyncError(dispatch))
  }
}

export function setDistributionOnServer () {
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    UserAPI.setDistribution(currentUserID, DISTRIBUTION).then(() => {
      logInfo('Distribution Set')
    }).catch(catchAsyncError(dispatch))
  }
}

export function signOut () {
  return (dispatch, getState) => {
    if (!getState().getIn(['localState', 'signingOut'])) {
      dispatch(setSigningOut(true))
      dispatch(stopLocationTracking())
      Promise.all([
        PouchCouch.deleteLocalDBs(),
        stopListeningFCM(),
        LocalStorage.deleteLocalState(),
        ApiClient.clearToken(),
      ]).then(() => {
        const activeComponent = getState().getIn(['localState', 'activeComponent'])
        if (activeComponent !== FEED) {
          return Navigation.popToRoot(activeComponent)
        }
      }).then(() => {
        dispatch(switchRoot(SIGNUP_LOGIN))
        dispatch(clearState())
        dispatch(setSigningOut(false))
      }).catch(e => {
        logDebug(e)
      })
    }
  }
}

export function showLocalNotification (message, background, rideID, scrollToComments) {
  return (dispatch, getState) => {
    PushNotification.configure({
      onNotification: () => {
        const activeComponent = getState().getIn(['localState', 'activeComponent'])
        if (activeComponent !== FEED) {
          Navigation.popToRoot(activeComponent)
        }
        dispatch(showPopShowRide())
      }
    })
    dispatch(awaitFullSync())
    dispatch(syncDBPull()).then(() => {
      const showingRideID = getState().getIn(['localState', 'showingRideID'])
      if (background || showingRideID !== rideID) {
        dispatch(setPopShowRide(rideID, false, scrollToComments))
        PushNotification.localNotification({
          message: message,
        })
      }
    }).catch(catchAsyncError)
  }
}

export function startLocationTracking () {
  return (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    configureBackgroundGeolocation().then(() => {
      const KALMAN_FILTER_Q = 6
      BackgroundGeolocation.on('location', (location) => {
        const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
        let timeDiff = 0
        if (lastLocation) {
          timeDiff = (location.time / 1000) - (lastLocation.get('timestamp') / 1000)
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
    }).catch(catchAsyncError(dispatch))

    BackgroundGeolocation.on('error', (error) => {
      logError('[ERROR] BackgroundGeolocation error:', error);
      captureException(error)
    });

    BackgroundGeolocation.start()
  }
}

function startNetworkTracking () {
  return (dispatch, getState) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      const gc = goodConnection(
        connectionInfo.type,
        connectionInfo.effectiveType
      )
      dispatch(newNetworkState(gc))
    }).catch(catchAsyncError(dispatch))
    NetInfo.addEventListener(
      'connectionChange',
      (connectionInfo) => {
        const gc = goodConnection(
          connectionInfo.type,
          connectionInfo.effectiveType
        )
        dispatch(newNetworkState(gc))
        if (gc) {
          dispatch(runPhotoQueue())
          const needsPersist = getState().getIn(['localState', 'needsRemotePersist'])
          const needsAnyPersist = needsPersist.valueSeq().filter(x => x).count() > 0
          if (needsAnyPersist) {
            for (let db of needsPersist.keySeq()) {
              if (needsPersist.get(db)) {
                dispatch(doRemotePersist(db))
              }
            }
          }
        }
      }
    )
  }
}

export function startListeningFCM () {
  return (dispatch) => {
    firebase.messaging().onMessage((m) => {
      handleNotification(dispatch, m._data, false)
    })
  }
}

export function startListeningFCMTokenRefresh () {
  return (dispatch) => {
    firebase.messaging().getToken().then(newToken => {
      if (newToken) {
        dispatch(setFCMTokenOnServer(newToken))
      }
    })
    firebase.messaging().onTokenRefresh((newToken) => {
      dispatch(setFCMTokenOnServer(newToken))
    })
  }
}

function startActiveComponentListener () {
  return (dispatch) => {
    Navigation.events().registerComponentDidAppearListener( ( { componentId } ) => {
      if (componentId !== DRAWER) {
        dispatch(setActiveComponent(componentId))
      }
    })
  }
}

export function stopLocationTracking () {
  return (dispatch) => {
    BackgroundGeolocation.stop()
    BackgroundGeolocation.removeAllListeners('location')
    dispatch(clearLastLocation())
  }
}

function startAppStateTracking () {
  return (dispatch, getState) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
      const onRide = Boolean(getState().getIn(['currentRide', 'currentRide']))
      if (onRide && nextAppState === appStates.active) {
        const activeComponent = getState().getIn(['localState', 'activeComponent'])
        const popShowRideActive = getState().getIn(['localState', 'popShowRide'])
        if (activeComponent !== RECORDER
          && activeComponent !== UPDATE_NEW_RIDE_ID
          && activeComponent !== CAMERA
          && !popShowRideActive) {
          Navigation.push(activeComponent, {
            component: {
              name: RECORDER,
              id: RECORDER
            }
          });
        }
      }
    })
  }
}

export function submitLogin (email, password) {
  return (dispatch) => {
    loginAndSync(UserAPI.login, [email, password], dispatch)
  }
}

export function submitSignup (email, password) {
  return (dispatch) => {
    loginAndSync(UserAPI.signup, [email, password], dispatch)
  }
}

export function syncDBPull () {
  return (dispatch, getState) => {
    logInfo('action syncDBPull')
    dispatch(setFeedMessage(Map({
      message: 'Loading...',
      color: warning,
    })))
    const userID = getState().getIn(['localState', 'userID'])
    const follows = getState().getIn(['pouchRecords', 'follows'])
    const following = follows.valueSeq().filter(
      f => !f.get('deleted') && f.get('followerID') === userID
    ).map(
      f => f.get('followingID')
    ).toJS()

    const followers = follows.valueSeq().filter(
      f => !f.get('deleted') && f.get('followingID') === userID
    ).map(
      f => f.get('followerID')
    ).toJS()
    following.push(userID)

    dispatch(setFullSyncFail(false))
    return PouchCouch.localReplicateDB('all', following, followers).then(() => {
      return PouchCouch.localLoad()
    }).then(localData => {
      dispatch(localDataLoaded(localData))
      dispatch(syncComplete())
      dispatch(setFeedMessage(Map({
        message: 'Data Loaded',
        color: green,
        timeout: 3000
      })))
      setTimeout(() => {
        dispatch(clearFeedMessage())
      }, 3000)
    }).catch((e) => {
      if (e.status === 401) {
        catchAsyncError(dispatch)(e)
      }
      dispatch(setFeedMessage(Map({
        message: 'Error Fetching Data',
        color: warning,
      })))
      setTimeout(() => {
        dispatch(clearFeedMessage())
      }, 3000)
      dispatch(setFullSyncFail(true))
    })
  }
}

export function switchRoot (newRoot) {
  return () => {
    if (newRoot === FEED) {
      Navigation.setRoot({
        root: {
          sideMenu: {
            left: {
              visible: true,
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
        }
      });
    } else if (newRoot === SIGNUP_LOGIN) {
      Navigation.setRoot({
        root: {
          component: {
            name: SIGNUP_LOGIN,
            id: SIGNUP_LOGIN
          },
        }
      });
    } else {
      throw Error('That\'s a bad route, jerk.')
    }
  }
}

export function toggleRideCarrot (rideID) {
  return (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    let existing = getState().getIn(['pouchRecords', 'rideCarrots']).valueSeq().filter((c) => {
      return c.get('rideID') === rideID && c.get('userID') === currentUserID
    })
    existing = existing.count() > 0 ? existing.get(0) : null

    let save
    if (existing) {
      let toggled = existing.set('deleted', !existing.get('deleted'))
      dispatch(rideCarrotSaved(toggled))
      save = PouchCouch.saveRide(toggled.toJS()).then((doc) => {
        let afterSave = getState().getIn(['pouchRecords', 'rideCarrots', toggled.get('_id')])
        dispatch(rideCarrotSaved(afterSave.set('_rev', doc.rev)))
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
      dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError(dispatch))
  }
}
