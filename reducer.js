import {
  CHANGE_SCREEN,
  CLEAR_STATE,
  DISCARD_RIDE,
  DISMISS_ERROR,
  HORSES_FETCHED,
  HORSE_SAVED,
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RIDE_SAVED_LOCALLY,
  RIDE_SAVED_REMOTELY,
  RIDES_FETCHED,
  START_RIDE, JUST_FINISHED_RIDE_SHOWN, ERROR_OCCURRED,
} from './constants'
import { haversine } from './helpers'
import { FIRST_SCREEN } from "./App"
import { RIDES } from './screens'

const initialState = {
  app: 'login',
  currentScreen: RIDES,
  currentRide: null,
  error: null,
  geoWatchID: null,
  horses: [],
  justFinishedRide: false,
  jwtToken: null,
  lastLocation: null,
  rides: [],
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CHANGE_SCREEN:
      return Object.assign({}, state, {
        currentScreen: action.screen,
      })
    case CLEAR_STATE:
      return Object.assign({}, initialState, {
        lastLocation: state.lastLocation
      })
    case NEW_GEO_WATCH:
      return Object.assign({}, state, {
        geoWatchID: action.geoWatchID
      })
    case DISCARD_RIDE:
      return Object.assign({}, state, {
        currentRide: null
      })
    case DISMISS_ERROR:
      return Object.assign({}, state, {
        error: null
      })
    case ERROR_OCCURRED:
      return Object.assign({}, state, {
        error: action.message
      })
    case HORSES_FETCHED:
      return Object.assign({}, state, {
        horses: action.horses
      })
    case HORSE_SAVED:
      return Object.assign({}, state, {
        horses: [action.horseData, ...state.horses]
      })
    case JUST_FINISHED_RIDE_SHOWN:
      return Object.assign({}, state, {
        justFinishedRide: false
      })
    case NEW_LOCATION:
      const newState = Object.assign({}, state, {
        lastLocation: action.location
      })
      if (state.currentRide && state.lastLocation) {
        const newDistance = haversine(
          state.lastLocation.latitude,
          state.lastLocation.longitude,
          action.location.latitude,
          action.location.longitude
        )
        newState.currentRide = {
          ...state.currentRide,
          rideCoordinates: [...state.currentRide.rideCoordinates, action.location],
          distance: state.currentRide.distance + newDistance,
        }
      }
      return newState
    case RECEIVE_JWT:
      return Object.assign({}, state, {
        app: 'after-login',
        jwtToken: action.token
      })
    case RIDE_SAVED_LOCALLY:
      return Object.assign({}, state, {
        rides: [action.ride, ...state.rides],
        justFinishedRide: true,
        currentRide: null,
      })
    case RIDE_SAVED_REMOTELY:
      return state
    case RIDES_FETCHED:
      return Object.assign({}, state, {
        rides: action.rides
      })
    case START_RIDE:
      if (state.lastLocation) {
        action.currentRide.rideCoordinates.push(state.lastLocation)
      }
      return Object.assign({}, state, {
        currentRide: action.currentRide
    })
    default:
      return state
  }
}