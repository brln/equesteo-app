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

import functional, { catchAsyncError } from './functional'
import { logInfo } from '../helpers'
import { FEED, NEEDS_SYNC } from '../screens/consts/main'
import { Amplitude, LocalStorage } from '../services'

import { setUserContext } from "../services/Sentry"
import TimeoutManager from '../services/TimeoutManager'
import { UnauthorizedError, UserAlreadyExistsError } from "../errors"

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

