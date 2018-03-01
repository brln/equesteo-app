import RideAPI from './services/ride_api'
import UserAPI from './services/user_api'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  RECEIVE_JWT,
  RIDE_SAVED ,
  RIDES_FETCHED,
} from './constants'

function changeAppRoot(root) {
  return {
    type: CHANGE_ROOT,
    root
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

export function appInitialized() {
  return async (dispatch, getState) => {
    dispatch(changeAppRoot('login'))
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

export function submitLogin(email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
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