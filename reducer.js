import {
  CHANGE_SCREEN,
  CLEAR_SEARCH,
  CLEAR_STATE,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RECEIVE_USER_DATA,
  SAVE_HORSE,
  SAVE_RIDE,
  START_RIDE,
  USER_SEARCH_RETURNED,
} from './constants'
import { haversine } from './helpers'
import { FEED } from './screens'

const initialState = {
  app: 'login',
  currentScreen: FEED,
  currentRide: null,
  error: null,
  horses: [],
  justFinishedRide: false,
  jwt: null,
  lastLocation: null,
  rides: [],
  userData: {},
  userLoaded: false,
  userSearchResults: []
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CHANGE_SCREEN:
      return Object.assign({}, state, {
        currentScreen: action.screen,
      })
    case CLEAR_SEARCH:
      return Object.assign({}, state, {
        userSearchResults: []
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
    case JUST_FINISHED_RIDE_SHOWN:
      return Object.assign({}, state, {
        justFinishedRide: false
      })
    case LOCAL_DATA_LOADED:
      return Object.assign({}, state, {
        ...action.localData,
        currentScreen: FEED
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
        jwt: action.token
      })
    case RECEIVE_USER_DATA:
      return Object.assign({}, state, {
        userData: action.userData,
        userLoaded: true
      })
    case SAVE_HORSE:
      return Object.assign({}, state, {
        horses: [action.horse, ...state.horses]
      })
    case SAVE_RIDE:
      const newRide = {
        ...state.currentRide,
        ...action.ride,
        userID: state.userData.id
      }
      return Object.assign({}, state, {
        rides: [newRide, ...state.rides],
        justFinishedRide: true,
        currentRide: null,
      })
    case START_RIDE:
      if (state.lastLocation) {
        action.currentRide.rideCoordinates.push(state.lastLocation)
      }
      return Object.assign({}, state, {
        currentRide: action.currentRide
      })
    case USER_SEARCH_RETURNED:
      return Object.assign({}, state, {
        userSearchResults: action.userSearchResults
      })
    default:
      return state
  }
}