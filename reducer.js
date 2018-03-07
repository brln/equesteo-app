import {
  CLEAR_STATE,
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RIDE_SAVED,
  RIDES_FETCHED,
  START_RIDE,
} from './constants'
import { haversine } from './helpers'

const initialState = {
  app: 'login',
  currentRide: null,
  geoWatchID: null,
  jwtToken: null,
  lastLocation: null,
  rides: [],
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_STATE:
      return Object.assign({}, initialState)
    case NEW_GEO_WATCH:
      return Object.assign({}, state, {
        geoWatchID: action.geoWatchID
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
        debugger
        newState.currentRide = {
          ...state.currentRide,
          ride_coordinates: [...state.currentRide.ride_coordinates, action.location],
          totalDistance: state.currentRide.totalDistance + newDistance,
        }
      }
      return newState
    case RECEIVE_JWT:
      return Object.assign({}, state, {
        app: 'after-login',
        jwtToken: action.token
      })
    case RIDE_SAVED:
      return Object.assign({}, state, {
        rides: [action.ride, ...state.rides],
        currentRide: null,
      })
    case RIDES_FETCHED:
      return Object.assign({}, state, {
        rides: action.rides
      })
    case START_RIDE:
      if (state.lastLocation) {
        action.currentRide.ride_coordinates.push(state.lastLocation)
      }
      return Object.assign({}, state, {
        currentRide: action.currentRide
    })
    default:
      return state
  }
}