import PouchDB from 'pouchdb-react-native'

import { unixTimeNow } from "./helpers"
import { FEED } from './screens'
import { LocalStorage, UserAPI } from './services'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  CHANGE_SCREEN,
  CLEAR_SEARCH,
  CLEAR_STATE,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEW_LOCATION,
  RECEIVE_JWT,
  RECEIVE_USER_DATA,
  REHYDRATE_STATE,
  SAVE_HORSE,
  SAVE_RIDE,
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

export function clearSearch () {
  return {
    type: CLEAR_SEARCH
  }
}

function clearState () {
  return {
    type: CLEAR_STATE
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

function newLocation(location) {
  return {
    type: NEW_LOCATION,
    location
  }
}

function receiveJWT(token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

function receiveUserData(userData) {
  return {
    type: RECEIVE_USER_DATA,
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
    dispatch(startLocationTracking())
  }
}

export function createFollow (followingID) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.addFollow(followingID)
      dispatch(receiveUserData(resp))
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
      dispatch(receiveUserData(resp))
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
    await dispatch(syncToServer())
    await LocalStorage.deleteToken()
    dispatch(clearState())
  }
}

function startLocationTracking () {
  return async (dispatch) => {
    const getLocation = (location) => {
      const parsedLocation = {
        accuracy: location.coords.accuracy,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      }
      dispatch(newLocation(parsedLocation))
    }

    const getCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        getLocation,
        getCurrentPosition, // recursively run on error
        { enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 1000 }
      );
    }
    getCurrentPosition()

    navigator.geolocation.watchPosition(
      getLocation,
      null,
      {enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 10000, distanceFilter: 10}
    )
  }
}

export function submitLogin (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      const tokenedUserAPI = new UserAPI(resp.token)
      const dehydratedState = await tokenedUserAPI.getState()
      await dispatch(rehydrateState(dehydratedState))
      dispatch(changeScreen(FEED))
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(receiveJWT(resp.token))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function syncToServer () {
  return async (dispatch, getState) => {
    const dbName = getState().userData.id.toString()
    const localDB = new PouchDB(dbName)

    const state = await localDB.get('state')
    delete state.jwt
    delete state._id
    delete state._rev

    const userAPI = new UserAPI(getState().jwt)
    await userAPI.saveState(state)
  }
}

export function submitSignup (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(receiveJWT(resp.token))
      delete resp.token
      dispatch(receiveUserData(resp))
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function updateProfile (userData) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.updateProfile(userData)
      dispatch(receiveUserData(resp))
    } catch (e) {
      debugger
    }
  }
}

export function uploadProfilePhoto (photoLocation) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.uploadProfilePhoto(photoLocation)
      dispatch(receiveUserData(resp))
    } catch (e) {
      debugger
    }
  }
}


