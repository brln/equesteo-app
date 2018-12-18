import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import firebase from 'react-native-firebase'

import {
  dismissError,
  errorOccurred,
  loadCurrentRideState,
  loadLocalState,
  localDataLoaded,
  receiveJWT,
  saveUserID,
  setAwaitingPasswordChange,
  setDoingInitialLoad,
} from './standard'

import {
  getFCMToken,
  startListeningFCMTokenRefresh,
  startListeningFCM,
  setDistributionOnServer,
  switchRoot,
} from './functional'
import { logInfo } from '../helpers'
import { FEED } from '../screens'
import { LocalStorage, PouchCouch } from '../services'

import { setUserContext } from "../services/Sentry"

export function loginAndSync(loginFunc, loginArgs, dispatch) {
  let pouchCouch
  loginFunc(...loginArgs).then(resp => {
    // @TODO: figure out why followers have _id here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
    const token = resp.token
    const userID = resp.id
    const following = resp.following
    const followers = resp.followers
    pouchCouch = new PouchCouch(token)

    dispatch(dismissError())
    dispatch(setAwaitingPasswordChange(true))
    dispatch(receiveJWT(token))
    dispatch(saveUserID(userID))
    setUserContext(userID)
    dispatch(getFCMToken())
    dispatch(startListeningFCMTokenRefresh())
    dispatch(setDistributionOnServer())
    dispatch(setDoingInitialLoad(true))
    return Promise.all([
      pouchCouch.localReplicateDB('all', [...following, userID], followers),
      LocalStorage.saveToken(token, userID),
    ])
  }).then(() => {
    return pouchCouch.localLoad()
  }).then(localData => {
    dispatch(localDataLoaded(localData))
    dispatch(setDoingInitialLoad(false))
    dispatch(switchRoot(FEED))
    dispatch(startListeningFCM())
  }).catch(e => {
    dispatch(errorOccurred(e.message))
  })
}

export function tryToLoadStateFromDisk (dispatch) {
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
      dispatch(loadCurrentRideState(currentRideState))
    } else {
      logInfo('no cached current ride state found')
    }
  })
}

export function configureBackgroundGeolocation () {
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

export function stopListeningFCM () {
  // maybe delete token on server here?
  return firebase.iid().deleteToken('373350399276', 'GCM').then(() => {
    firebase.messaging().onTokenRefresh(() => {})
  })
}
