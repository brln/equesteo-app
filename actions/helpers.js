import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import firebase from 'react-native-firebase'

import {
  dismissError,
  errorOccurred,
  loadCurrentRideState,
  loadLocalState,
  saveUserID,
  setAwaitingPasswordChange,
  setDoingInitialLoad,
} from './standard'

import {
  doSync,
  startListeningFCMTokenRefresh,
  startListeningFCM,
  setDistributionOnServer,
  switchRoot,
} from './functional'
import { logError, logInfo } from '../helpers'
import { FEED } from '../screens'
import { LocalStorage } from '../services'

import { setUserContext } from "../services/Sentry"

export function loginAndSync(loginFunc, loginArgs, dispatch) {
  loginFunc(...loginArgs).then(resp => {
    const userID = resp.id
    const followingIDs = resp.following
    const followerIDs = resp.followers

    dispatch(dismissError())
    dispatch(setAwaitingPasswordChange(true))
    dispatch(saveUserID(userID))
    setUserContext(userID)
    dispatch(startListeningFCMTokenRefresh())
    dispatch(setDistributionOnServer())
    dispatch(setDoingInitialLoad(true))
    return dispatch(doSync({userID, followingIDs, followerIDs}))
  }).then(() => {
    dispatch(switchRoot(FEED))
    dispatch(startListeningFCM())
  }).catch(e => {
    logError(e)
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
  firebase.messaging().onTokenRefresh(() => {})
  return firebase.iid().deleteToken('373350399276', 'GCM')
}
