import { AppState, NetInfo } from 'react-native'
import PouchDB from 'pouchdb-react-native'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'

import { unixTimeNow, appStates } from "./helpers"
import { FEED } from './screens'
import { LocalStorage, UserAPI } from './services'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  CHANGE_SCREEN,
  CLEAR_LAST_LOCATION,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEEDS_TO_PERSIST,
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  NEW_REV,
  PERSIST_STARTED,
  PERSISTED,
  RECEIVE_JWT,
  REHYDRATE_STATE,
  SAVE_HORSE,
  SAVE_RIDE,
  SAVE_USER_DATA,
  START_RIDE,
  USER_SEARCH_RETURNED,
} from './constants'

function changeAppRoot(root) {
  return {
    type: CHANGE_ROOT,
    root
  }
}

export function changeScreen(screen) {
  return {
    type: CHANGE_SCREEN,
    screen
  }
}

export function clearLastLocation () {
  return {
    type: CLEAR_LAST_LOCATION,
  }
}

export function clearSearch () {
  return {
    type: CLEAR_SEARCH
  }
}

export function clearState () {
  return {
    type: CLEAR_STATE,
    persist: false
  }
}

function clearStateAfterPersist () {
  return {
    type: CLEAR_STATE_AFTER_PERSIST,
    persist: false
  }
}

export function discardRide ()  {
  return {
    type: DISCARD_RIDE
  }
}

export function dismissError () {
  return {
    type: DISMISS_ERROR
  }
}

export function errorOccurred (message) {
  return {
    type: ERROR_OCCURRED,
    message
  }
}

export function justFinishedRideShown () {
  return {
    type: JUST_FINISHED_RIDE_SHOWN
  }
}

export function localDataLoaded (localData) {
  return {
    type: LOCAL_DATA_LOADED,
    localData
  }
}

export function needsToPersist () {
  return {
    type: NEEDS_TO_PERSIST,
    persist: false,
  }
}

function newAppState (newState) {
  return {
    type: NEW_APP_STATE,
    newState,
    persist: false
  }
}

function newLocation (location) {
  return {
    type: NEW_LOCATION,
    location
  }
}

export function newRev (rev) {
  return {
    type: NEW_REV,
    persist: false,
    rev
  }
}

function newNetworkState (connectionType, effectiveConnectionType) {
  return {
    type: NEW_NETWORK_STATE,
    connectionType,
    effectiveConnectionType,
  }
}

export function persisted () {
  return {
    type: PERSISTED,
    persist: false,
  }
}

function receiveJWT (token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

export function saveUserData(userData) {
  return {
    type: SAVE_USER_DATA,
    userData
  }
}

function rehydrateState(dehydratedState) {
  return {
    type: REHYDRATE_STATE,
    dehydratedState
  }
}

export function saveHorse (horse) {
  return {
    type: SAVE_HORSE,
    horse
  }
}

export function saveRide (ride) {
  return {
    type: SAVE_RIDE,
    ride
  }
}

export function startRide() {
  return {
    type: START_RIDE,
    currentRide: {
      rideCoordinates: [],
      distance: 0,
      startTime: unixTimeNow()
    },
  }
}

export function userSearchReturned (userSearchResults) {
  return {
    type: USER_SEARCH_RETURNED,
    userSearchResults,
  }
}

//  =========================================
// |<  FUNCTIONAL ACTIONS                |||>>
//  =========================================

export function appInitialized () {
  return async (dispatch) => {
    dispatch(findLocalToken())
    dispatch(changeAppRoot('login'))
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
  }
}

export function createFollow (followingID) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.addFollow(followingID)
      // dispatch(receiveUserData(resp))
    } catch (e) {
      console.log(e)
      alert('error in console')
    }
  }
}

export function deleteFollow (followingID) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.deleteFollow(followingID)
      // dispatch(receiveUserData(resp))
    } catch (e) {
      console.log(e)
      alert('error in console')
    }
  }
}

function findLocalToken () {
  return async (dispatch) => {
    const storedToken = await LocalStorage.loadToken()
    if (storedToken !== null) {
      dispatch(receiveJWT(storedToken.token))
      dispatch(loadLocalData(storedToken.userID.toString()))
    }
  }
}

function loadLocalData (databaseName) {
  return async (dispatch) => {
    const localDB = new PouchDB(databaseName)
    const localData = await localDB.get('state')
    dispatch(localDataLoaded(localData))
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.findUser(phrase)
      dispatch(userSearchReturned(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function signOut () {
  return async(dispatch) => {
    await LocalStorage.deleteToken()
    dispatch(clearStateAfterPersist())
    dispatch(needsToPersist())
  }
}

export function startLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 10,
      distanceFilter: 10,
      maxLocations: 10,
      notificationTitle: 'You\'re out on a ride a ride.',
      notificationText: 'Tap here to see your progress.',
      // debug: true,
      locationProvider: BackgroundGeolocation.RAW_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
    });

    BackgroundGeolocation.on('location', (location) => {
      const parsedLocation = {
        accuracy: location.accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.time,
      }
      if (location.accuracy < 50) {
        dispatch(newLocation(parsedLocation))
      } else {
        console.log('discarding low accuracy: ' + location.accuracy)
      }

    })

    BackgroundGeolocation.start()
  }
}

function startNetworkTracking () {
  return async (dispatch) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      dispatch(newNetworkState(connectionInfo.type, connectionInfo.effectiveType))
    });
    NetInfo.addEventListener(
      'connectionChange',
      (connectionInfo) => {
        dispatch(newNetworkState(connectionInfo.type, connectionInfo.effectiveType))
      }
    );
  }
}

export function stopLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.stop()
    dispatch(clearLastLocation())
  }
}

function startAppStateTracking () {
  return async (dispatch) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
    })
  }
}

export function submitLogin (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      const tokenedUserAPI = new UserAPI(resp.token)
      const dehydratedState = await tokenedUserAPI.getState()
      dispatch(rehydrateState(dehydratedState))
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(receiveJWT(resp.token))
      dispatch(changeScreen(FEED))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function submitSignup (email, password) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(saveUserData({...getState().userData, id: resp.id}))
      dispatch(receiveJWT(resp.token))
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function uploadProfilePhoto (photoLocation) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.uploadProfilePhoto(photoLocation)
      // dispatch(receiveUserData(resp))
    } catch (e) {
      debugger
    }
  }
}


