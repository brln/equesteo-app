import ImagePicker from 'react-native-image-crop-picker'
import { fromJS, Map  } from 'immutable'
import { AppState, NetInfo } from 'react-native'
import { DISTRIBUTION } from 'react-native-dotenv'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import { ENV } from 'react-native-dotenv'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'

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
import { appStates, coordSplice } from '../helpers'
import { CAMERA, DRAWER, FEED, RECORDER, SIGNUP_LOGIN, UPDATE_NEW_RIDE_ID } from '../screens'
import { LocalStorage, PouchCouch, RidePersister, UserAPI } from '../services'
import {BadRequestError, NotConnectedError, UnauthorizedError} from "../errors"

const DB_NEEDS_SYNC = 'DB_NEEDS_SYNC'
const DB_SYNCING = 'DB_SYNCING'
const DB_SYNCED = 'DB_SYNCED'

import {
  awaitFullSync,
  clearLastLocation,
  clearFeedMessage,
  clearStateAfterPersist,
  deleteUnpersistedPhoto,
  dequeuePhoto,
  dismissError,
  enqueuePhoto,
  errorOccurred,
  horsePhotoUpdated,
  horseUpdated,
  followUpdated,
  horseUserUpdated,
  loadCurrentRideState,
  loadLocalState,
  localDataLoaded,
  newAppState,
  newLocation,
  newNetworkState,
  receiveJWT,
  replaceLastLocation,
  rideCoordinatesLoaded,
  rideCarrotCreated,
  rideCarrotSaved,
  rideCommentUpdated,
  ridePhotoUpdated,
  setPopShowRide,
  setRemotePersistDB,
  setFeedMessage,
  setFullSyncFail,
  showPopShowRide,
  saveUserID,
  setActiveComponent,
  syncComplete,
  setAwaitingPasswordChange,
  setDoingInitialLoad,
  updatePhotoStatus,
  userPhotoUpdated,
  userSearchReturned,
  userUpdated,
} from './standard'

export function catchAsyncError (e) {
  logError(e)
  captureException(e)
  setTimeout(() => {
    throw Error('Async error')
  }, 0)
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
  return async (dispatch) => {
    await dispatch(tryToLoadStateFromDisk())
    dispatch(startActiveComponentListener())
    dispatch(dismissError())
    dispatch(checkFCMPermission())
    dispatch(findLocalToken())
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
  }
}

export function checkFCMPermission () {
  return async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (!enabled) {
      try {
        const resp = await firebase.messaging().requestPermission();
      } catch (error) {
        alert('YOU HAVE TO.')
        throw error
      }
    }
  }
}

function configureBackgroundGeolocation () {
  return async () => {
    logInfo('configuring geolocation')
    // @TODO this should return a promise wrapped around callback
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      locationProvider: BackgroundGeolocation.RAW_PROVIDER,
      distanceFilter: 0,
      maxLocations: 10,
      interval: 0,
      notificationTitle: 'You\'re out on a ride.',
      notificationText: 'Tap here to see your progress.',
    });
  }
}

export function createRideComment(commentData) {
  return (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
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
    pouchCouch.saveRide(newComment.toJS()).then((doc) => {
      const afterSave = getState().getIn(['pouchRecords', 'rideComments', commentID])
      dispatch(rideCommentUpdated(afterSave.set('_rev', doc.rev)))
      dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError)

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
  return async (dispatch) => {
    let userAPI = new UserAPI()
    try {
      const resp = await userAPI.exchangePWCodeForToken(email, code)
      dispatch(dismissError())
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const followers = resp.followers
      const pouchCouch = new PouchCouch(token)
      dispatch(setAwaitingPasswordChange(true))
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      dispatch(receiveJWT(resp.token))
      dispatch(saveUserID(resp.id))
      setUserContext(resp.id)
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(setDistributionOnServer())
      dispatch(startListeningFCM())
      await LocalStorage.saveToken(resp.token, resp.id);
    } catch (e) {
      logError(e)
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}



function findLocalToken () {
  return async (dispatch) => {
    const storedToken = await LocalStorage.loadToken()
    if (storedToken !== null) {
      dispatch(receiveJWT(storedToken.token))
      dispatch(saveUserID(storedToken.userID))
      setUserContext(storedToken.userID)
      dispatch(switchRoot(FEED))
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
      dispatch(setDistributionOnServer())
      dispatch(syncDBPull('all'))
    } else {
      dispatch(switchRoot(SIGNUP_LOGIN))
    }
  }
}

export function getPWCode (email) {
  return async () => {
    let userAPI = new UserAPI()
    await userAPI.getPWCode(email)
  }
}

export function getFCMToken () {
  return async (dispatch) => {
    let fcmToken
    try {
      fcmToken = await firebase.messaging().getToken();
    } catch (e) {
      logInfo('no token available')
    }
    if (fcmToken) {
      dispatch(setFCMTokenOnServer(fcmToken))
    }
  }
}

function loadLocalData () {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    try {
      logInfo('==== Starting local data load ===')
      const localData = await pouchCouch.localLoad()
      logInfo('==== Local data loaded from pouch complete ===')
      dispatch(localDataLoaded(localData))
    } catch (e) {
      logError(e)
      throw e
    }
  }
}

export function loadRideCoordinates (rideID) {
  return (dispatch) => {
    const pouchCouch = new PouchCouch()
    pouchCouch.loadRideCoordinates(rideID).then((coords) => {
      dispatch(rideCoordinatesLoaded(coords))
    }).catch(catchAsyncError)
  }
}

export function newPassword (password) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    try {
      await userAPI.changePassword(password)
      dispatch(switchRoot(FEED))
    } catch (e) {
      logError(e)
    }
  }
}

export function doRemotePersist(db) {
  return (dispatch, getState) => {
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    const jwt = getState().getIn(['localState', 'jwt'])
    if (jwt && goodConnection) {
      const pouchCouch = new PouchCouch(jwt)
      dispatch(remotePersistStarted(db))
      pouchCouch.remoteReplicateDB(db).on('complete', () => {
        dispatch(remotePersistComplete(db))
      }).on('error', () => {
        dispatch(remotePersistError(db))
      }).on('denied', () => {
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
  return async (dispatch, getState) => {
    const theFollow = getState().getIn(['pouchRecords', 'follows', followID])
    if (!theFollow) {
      throw new Error('no follow with that ID')
    }

    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(theFollow.toJS())

    let foundAfterSave = getState().getIn(['pouchRecords', 'follows', followID])
    dispatch(followUpdated(foundAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
    dispatch(syncDBPull())
  }
}

export function persistRide (rideID, newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
  return (dispatch, getState) => {
    const ridePersister = new RidePersister(dispatch, getState, rideID)
    ridePersister.persistRide(newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses)
  }
}

export function persistUser (userID) {
  return async (dispatch, getState) => {
    const theUser = getState().getIn(['pouchRecords', 'users', userID])
    if (!theUser) {
      throw new Error('no user with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(theUser.toJS())

    const theUserAfterSave = getState().getIn(['pouchRecords', 'users', userID])
    dispatch(userUpdated(theUserAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function persistUserPhoto (userPhotoID) {
  return async (dispatch, getState) => {
    const theUserPhoto = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
    if (!theUserPhoto) {
      throw new Error('no user photo with that ID: ' + userPhotoID)
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(theUserPhoto.toJS())

    const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', userPhotoID])
    dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function persistHorseWithPhoto (horseID, horsePhotoID) {
  return (dispatch, getState) => {
    const theHorsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', horsePhotoID])
    if (!theHorsePhoto) {
      throw new Error('no horse photo with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)

    pouchCouch.saveHorse(theHorsePhoto.toJS()).then((doc) => {
      const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', horsePhotoID])
      dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
      dispatch(photoNeedsUpload('horse', theHorsePhoto.get('uri'), horsePhotoID))
      const theHorse = getState().getIn(['pouchRecords', 'horses', horseID])
      if (!theHorse) {
        throw new Error('no horse with that ID')
      }
      return pouchCouch.saveHorse(theHorse.toJS())
    }).then((doc) => {
      const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
      dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
      dispatch(needsRemotePersist('horses'))
    })
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

    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const horseSaves = pouchCouch.saveHorse(theHorse.toJS()).then((doc) => {
      const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
      dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
      const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
      return pouchCouch.saveHorse(theHorseUser.toJS())
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
          return pouchCouch.saveHorse(deleted.toJS()).then((doc) => {
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
          return pouchCouch.saveHorse(theHorsePhoto.toJS()).then((doc) => {
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
            return pouchCouch.saveHorse(withoutDefault.toJS()).then((doc) => {
              const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', withoutDefault.get('_id')])
              dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', doc.rev)))
            })
          })
        }
      })
    }

    horseSaves.then(() => {
      dispatch(needsRemotePersist('horses'))
    })
  }
}

export function persistHorseUser (horseUserID) {
  return async (dispatch, getState) => {
    const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw new Error('no horse user with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveHorse(theHorseUser.toJS())

    const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    await dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function photoNeedsUpload (type, photoLocation, photoID) {
  return (dispatch, getState) => {
    const item = Map({
      type,
      photoLocation,
      photoID,
      status: 'enqueued',
      timestamp: unixTimeNow()
    })
    dispatch(enqueuePhoto(item))

    getState().getIn(['localState', 'photoQueue']).forEach((p) => {
      if (p.get('status') === 'enqueued'
        || p.get('status') === 'failed'
        || p.get('status') === 'uploading' && unixTimeNow() - p.get('timestamp') > 300000) {
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
    const jwt = getState().getIn(['localState', 'jwt'])
    const goodConnection = getState().getIn(['localState', 'goodConnection'])
    if (jwt && goodConnection) {
      dispatch(updatePhotoStatus(photoID, 'uploading'))
      const userAPI = new UserAPI(jwt)
      userAPI.uploadPhoto(type, photoLocation, photoID).then(() => {
        const pouchCouch = new PouchCouch(jwt)
        switch (type) {
          case 'horse':
            const uploadedHorseURI = horsePhotoURL(photoID)
            const horsePhoto = getState().getIn(['pouchRecords', 'horsePhotos', photoID]).set('uri', uploadedHorseURI)
            dispatch(horsePhotoUpdated(horsePhoto))
            return pouchCouch.saveHorse(horsePhoto.toJS()).then((doc) => {
              const theHorsePhotoAfterSave = getState().getIn(['pouchRecords', 'horsePhotos', photoID])
              dispatch(horsePhotoUpdated(theHorsePhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('horses'))
            })
          case 'ride':
            const uploadedRideURI = ridePhotoURL(photoID)
            const ridePhoto = getState().getIn(['pouchRecords', 'ridePhotos', photoID]).set('uri', uploadedRideURI)
            dispatch(ridePhotoUpdated(ridePhoto))
            logDebug(ridePhoto.toJSON(), 'wut')
            return pouchCouch.saveRide(ridePhoto.toJS()).then((doc) => {
              const theRidePhotoAfterSave = getState().getIn(['pouchRecords', 'ridePhotos', photoID])
              dispatch(ridePhotoUpdated(theRidePhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('rides'))
            })
          case 'user':
            const uploadedUserPhotoURI = profilePhotoURL(photoID)
            const userPhoto = getState().getIn(['pouchRecords', 'userPhotos', photoID]).set('uri', uploadedUserPhotoURI)
            dispatch(userPhotoUpdated(userPhoto))
            return pouchCouch.saveUser(userPhoto.toJS()).then((doc) => {
              const theUserPhotoAfterSave = getState().getIn(['pouchRecords', 'userPhotos', photoID])
              dispatch(userPhotoUpdated(theUserPhotoAfterSave.set('_rev', doc.rev)))
              dispatch(needsRemotePersist('users'))
              dispatch(persistUserPhoto(userPhoto.get('_id')))
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
  return async (dispatch) => {
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
  return async (dispatch) => {
    dispatch(setRemotePersistDB(db, DB_NEEDS_SYNC))
    dispatch(setFeedMessage(Map({
      message: 'Can\'t Upload Data',
      color: danger,
    })))
  }
}

export function remotePersistStarted (db) {
  return async (dispatch) => {
    dispatch(setRemotePersistDB(db, DB_SYNCING))
    dispatch(setFeedMessage(Map({
      message: 'Data Uploading',
      color: warning,
    })))
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    try {
      const resp = await userAPI.findUser(phrase)
      dispatch(userSearchReturned(fromJS(resp)))
    } catch (e) {
      logError(e)
    }
  }
}

export function setFCMTokenOnServer (token) {
  return async (_, getState) => {
    try {
      const jwt = getState().getIn(['localState', 'jwt'])
      const userAPI = new UserAPI(jwt)
      const currentUserID = getState().getIn(['localState', 'userID'])
      await userAPI.setFCMToken(currentUserID, token)
    } catch (e) {
      logError('Could not set FCM token')
    }
  }
}

export function setDistributionOnServer () {
  return (_, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    const currentUserID = getState().getIn(['localState', 'userID'])
    userAPI.setDistribution(currentUserID, DISTRIBUTION).catch(() => {})
  }
}

export function signOut () {
  return async(dispatch) => {
    dispatch(stopLocationTracking())
    dispatch(clearStateAfterPersist())

    const pouchCouch = new PouchCouch()
    await Promise.all([
      LocalStorage.deleteToken(),
      pouchCouch.deleteLocalDBs(),
      dispatch(stopListeningFCM()),
      LocalStorage.deleteLocalState()
    ])
    dispatch(switchRoot(SIGNUP_LOGIN))
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
    })

  }
}

export function startLocationTracking () {
  return async (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    await configureBackgroundGeolocation()()
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
    }).catch(catchAsyncError)
    NetInfo.addEventListener(
      'connectionChange',
      (connectionInfo) => {
        const gc = goodConnection(
          connectionInfo.type,
          connectionInfo.effectiveType
        )
        dispatch(newNetworkState(gc))
        //
        const needsPersist = getState().getIn(['localState', 'needsRemotePersist'])
        const needsAnyPersist = needsPersist.valueSeq().filter(x => x).count() > 0
        const jwt = getState().getIn(['localState', 'jwt'])
        if (needsAnyPersist && jwt && gc) {
          for (let db of needsPersist.keySeq()) {
            if (needsPersist.get(db)) {
              dispatch(doRemotePersist(db))
            }
          }
        }
      }
    )
  }
}

function startListeningFCM () {
  return async (dispatch) => {
    firebase.messaging().onMessage(async (m) => {
      handleNotification(dispatch, m._data, false)
    })
  }
}

function startListeningFCMTokenRefresh () {
  return async (dispatch, getState) => {
    firebase.messaging().onTokenRefresh(async (newToken) => {
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

function stopListeningFCM () {
  return async () => {
    // maybe delete token on server here?
    logInfo('deleting local FCM token')
    await firebase.iid().deleteToken('373350399276', 'GCM')
    firebase.messaging().onTokenRefresh(() => {})
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
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(dismissError())
      dispatch(setDoingInitialLoad(true))
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const followers = resp.followers
      const pouchCouch = new PouchCouch(token)
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      await dispatch(loadLocalData())
      dispatch(receiveJWT(resp.token))
      dispatch(switchRoot(FEED))
      dispatch(setDoingInitialLoad(false))
      dispatch(saveUserID(resp.id))
      setUserContext()
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(setDistributionOnServer())
      dispatch(startListeningFCM())
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      } else if (e instanceof NotConnectedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function submitSignup (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      dispatch(dismissError())
      dispatch(setDoingInitialLoad(true))
      await LocalStorage.saveToken(resp.token, resp.id);
      const following = resp.following
      const userID = resp.id
      const pouchCouch = new PouchCouch(resp.token)
      await pouchCouch.localReplicateDB('all', [...following, userID], [])
      dispatch(receiveJWT(resp.token))
      dispatch(switchRoot(FEED))
      dispatch(setDoingInitialLoad(false))
      dispatch(saveUserID(resp.id))
      setUserContext()
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(setDistributionOnServer())
      dispatch(startListeningFCM())
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function syncDBPull () {
  return async (dispatch, getState) => {
    logInfo('action syncDBPull')
    dispatch(setFeedMessage(Map({
      message: 'Loading...',
      color: warning,
    })))
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
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
    try {
      dispatch(setFullSyncFail(false))
      await pouchCouch.localReplicateDB('all', following, followers)
      await dispatch(loadLocalData())
      dispatch(syncComplete())
      dispatch(setFeedMessage(Map({
        message: 'Data Loaded',
        color: green,
        timeout: 3000
      })))
      setTimeout(() => {
        dispatch(clearFeedMessage())
      }, 3000)
    } catch (e) {
      dispatch(setFeedMessage(Map({
        message: 'Error Fetching Data',
        color: warning,
      })))
      setTimeout(() => {
        dispatch(clearFeedMessage())
      }, 3000)
      dispatch(setFullSyncFail(true))
    }
  }
}

function switchRoot (newRoot) {
  return async () => {
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
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentUserID = getState().getIn(['localState', 'userID'])
    let existing = getState().getIn(['pouchRecords', 'rideCarrots']).valueSeq().filter((c) => {
      return c.get('rideID') === rideID && c.get('userID') === currentUserID
    })
    existing = existing.count() > 0 ? existing.get(0) : null

    let save
    if (existing) {
      let toggled = existing.set('deleted', !existing.get('deleted'))
      dispatch(rideCarrotSaved(toggled))
      save = pouchCouch.saveRide(toggled.toJS()).then((doc) => {
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
      save = pouchCouch.saveRide(newCarrot.toJS()).then(doc => {
        let afterSave = getState().getIn(['pouchRecords', 'rideCarrots', carrotID])
        dispatch(rideCarrotSaved(afterSave.set('_rev', doc.rev)))
      })
    }
    save.then(() => {
      dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError)
  }
}

export function tryToLoadStateFromDisk () {
  return async (dispatch) => {
    const [localState, currentRideState] = await Promise.all([
      await LocalStorage.loadLocalState(),
      await LocalStorage.loadCurrentRideState()
    ])
    if (localState) {
      dispatch(loadLocalState(localState))
    } else {
      logInfo('no cached local state found')
    }

    if (currentRideState) {
      dispatch(loadCurrentRideState(currentRideState))
    } else {
      logInfo('no cached current ride state found')
    }
  }
}
