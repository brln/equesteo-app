import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'

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
  catchAsyncError,
  doSync,
  removeForgotPWLinkListener,
  startListeningFCMTokenRefresh,
  startListeningFCM,
  setDistributionOnServer,
  switchRoot,
} from './functional'
import { logError, logInfo } from '../helpers'
import { FEED, NEEDS_SYNC } from '../screens/consts/main'
import { Amplitude, LocalStorage } from '../services'

import { setUserContext } from "../services/Sentry"

export function loginAndSync(loginFunc, loginArgs, dispatch, getState) {
  return loginFunc(...loginArgs).then(resp => {
    const userID = resp.id
    const followingIDs = resp.following
    const followerIDs = resp.followers

    dispatch(dismissError())
    dispatch(setAwaitingPasswordChange(true))
    dispatch(saveUserID(userID))
    setUserContext(userID)
    Amplitude.setUserID(userID)
    dispatch(startListeningFCMTokenRefresh())
    dispatch(setDoingInitialLoad(true))
    return dispatch(doSync({userID, followingIDs, followerIDs})).catch(catchAsyncError(dispatch))
  }).then(() => {
    // setDistribution needs to be far apart from FCMToken or they
    // end up in a race condition on the server. really, need to
    // consolidate the two calls.
    dispatch(setDistributionOnServer())
    const syncFail = getState().getIn(['localState', 'fullSyncFail'])
    if (!syncFail) {
      setTimeout(() => {
        dispatch(switchRoot(FEED))
        dispatch(startListeningFCM())
      }, 100)

    } else {
      dispatch(switchRoot(NEEDS_SYNC))
    }
    dispatch(removeForgotPWLinkListener())
  }).catch(e => {
    dispatch(errorOccurred(e.message))
    catchAsyncError(dispatch, 'loginAndSync')(e)
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
      logInfo('current ride state loaded')
      dispatch(loadCurrentRideState(currentRideState))
    } else {
      logInfo('no cached current ride state found')
    }
  }).catch(catchAsyncError(dispatch, 'tryToLoadStateFromDisk'))
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

