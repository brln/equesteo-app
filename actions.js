import { AsyncStorage } from 'react-native'

import { unixTimeNow } from "./helpers"
import { HorseAPI, RideAPI, UserAPI } from './services'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  CHANGE_SCREEN,
  CLEAR_STATE,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  HORSE_SAVED,
  HORSES_FETCHED,
  JUST_FINISHED_RIDE_SHOWN,
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RIDE_SAVED_LOCALLY,
  RIDE_SAVED_REMOTELY,
  RIDES_FETCHED,
  START_RIDE,
} from './constants'

TOKEN_KEY = '@equesteo:jwtToken'

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

export function horseSaved (horseData) {
  return {
    type: HORSE_SAVED,
    horseData
  }
}

export function horsesFetched (horses) {
  return {
    type: HORSES_FETCHED,
    horses
  }
}

export function justFinishedRideShown () {
  return {
    type: JUST_FINISHED_RIDE_SHOWN
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

function receiveJWT(token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

function rideSavedLocally (ride) {
  return {
    type: RIDE_SAVED_LOCALLY,
    ride
  }
}

function rideSavedRemotely (ride) {
  return {
    type: RIDE_SAVED_REMOTELY,
    ride
  }
}

function ridesFetched(rides) {
  return {
    type: RIDES_FETCHED,
    rides
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

function findLocalToken() {
  return async (dispatch) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token !== null) {
      dispatch(receiveJWT(token))
      dispatch(fetchRides(token))
      dispatch(fetchHorses(token))
    }
  }
}

export function saveNewHorse (horseData) {
  return async (dispatch, getState) => {
    const horseAPI = new HorseAPI(getState().jwtToken)
    try {
      const resp = await horseAPI.createHorse(horseData)
      dispatch(horseSaved(resp))
    } catch (e) {
      console.log(e)
      alert('error in console')
    }
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

    const watchID = navigator.geolocation.watchPosition(
      getLocation,
      null,
      {enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 10000, distanceFilter: 10}
    )
    dispatch(newGeoWatch(watchID))
  }
}

export function appInitialized() {
  return async (dispatch) => {
    dispatch(findLocalToken())
    dispatch(changeAppRoot('login'))
    dispatch(startLocationTracking())
  }
}

export function fetchHorses(token) {
  return async (dispatch) => {
    const horseAPI = new HorseAPI(token)
    try {
      const resp = await horseAPI.fetchHorses()
      dispatch(horsesFetched(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function fetchRides(token) {
  return async (dispatch) => {
    const rideAPI = new RideAPI(token)
    try {
      const resp = await rideAPI.fetchRides()
      dispatch(ridesFetched(resp))
    } catch (e) {
      console.log(e)
      alert('error in console')
    }
  }
}

export function localSaveRide(recorderDetails) {
  return async (dispatch, getState) => {
    try {
      const rideDetails = {
        ...getState().currentRide,
        ...recorderDetails,
      }
      // @TODO: actually save this locally and deal with repercussions.
      dispatch(rideSavedLocally(rideDetails))
      dispatch(remoteSaveRide(rideDetails))
    } catch (e) {
      console.log(e)
      alert('error in console')
    }
  }
}

function remoteSaveRide(rideDetails) {
  return async (dispatch, getState) => {
    const rideAPI = new RideAPI(getState().jwtToken)
    try {
      const resp = await rideAPI.saveRide(rideDetails)
      dispatch(rideSavedRemotely(resp))
    } catch (e) {
      // @TODO: deal with failure
      console.log(e)
      alert('error in console')
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
      dispatch(fetchHorses(resp.token))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
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
        dispatch(errorOccurred(e.message))
      }
    }
  }

}

