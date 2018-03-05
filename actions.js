import { AsyncStorage } from 'react-native'

import RideAPI from './services/ride_api'
import UserAPI from './services/user_api'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  CLEAR_STATE,
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RIDE_SAVED,
  RIDES_FETCHED,
} from './constants'

TOKEN_KEY = '@equestio:jwtToken'

function changeAppRoot(root) {
  return {
    type: CHANGE_ROOT,
    root
  }
}

function clearState () {
  return {
    type: CLEAR_STATE
  }
}

function receiveJWT(token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

function rideSaved(ride) {
  return {
    type: RIDE_SAVED,
    ride
  }
}

function ridesFetched(rides) {
  return {
    type: RIDES_FETCHED,
    rides
  }
}

function newGeoWatch(watchID) {
  return {
    type: NEW_GEO_WATCH,
    watchID
  }
}

function newLocation(location) {
  return {
    type: NEW_LOCATION,
    location
  }
}

function findLocalToken() {
  return async (dispatch) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token !== null) {
      dispatch(receiveJWT(token))
      dispatch(fetchRides(token))
    }
  }
}

function startLocationTracking () {
  return async (dispatch) => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        dispatch(newLocation(location))
      },
      null,
      { enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 1000 }
    );
    const watchID = navigator.geolocation.watchPosition(
      (location) => {
        dispatch(newLocation(location))
      },
      null,
      {enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 10000, distanceFilter: 20}
    )
    dispatch(newGeoWatch(watchID))
  }
}

export function stopLocationTracking () {
  return async (dispatch, getState) => {
    navigator.geolocation.clearWatch(getState.geoWatchID);
  }
}

export function appInitialized() {
  return async (dispatch, getState) => {
    dispatch(findLocalToken())
    dispatch(changeAppRoot('login'))
    dispatch(startLocationTracking())
  }
}

export function fetchRides(token) {
  return async (dispatch, getState) => {
    const rideAPI = new RideAPI(token)
    try {
      const resp = await rideAPI.fetchRides()
      dispatch(ridesFetched(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function saveRide(token, rideData) {
  return async (dispatch) => {
    const rideAPI = new RideAPI(token)
    try {
      const resp = await rideAPI.saveRide(rideData)
      dispatch(rideSaved(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function signOut () {
  return async(dispatch) => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    dispatch(clearState())
  }
}

export function submitLogin(email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      await AsyncStorage.setItem(TOKEN_KEY, resp.token);
      dispatch(receiveJWT(resp.token))
      dispatch(fetchRides(resp.token))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        // @Todo: put error handling back in here
        console.log(e)
      }
    }
  }
}

export function submitSignup(email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      dispatch(receiveJWT(resp.token))
    } catch (e) {
      if (e instanceof BadRequestError) {
        // @Todo: put error handling back in here
        console.log(e)
      }
    }
  }

}

