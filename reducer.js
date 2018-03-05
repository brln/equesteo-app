import {
  NEW_GEO_WATCH,
  NEW_LOCATION,
  RECEIVE_JWT,
  RIDE_SAVED,
  RIDES_FETCHED
} from './constants'

const initialState = {
  app: 'login',
  geoWatchID: null,
  jwtToken: null,
  lastLocation: null,
  rides: [],
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case NEW_GEO_WATCH:
      return Object.assign({}, state, {
        geoWatchID: action.geoWatchID
      })
    case NEW_LOCATION:
      return Object.assign({}, state, {
        lastLocation: action.location
      })
    case RECEIVE_JWT:
      return Object.assign({}, state, {
        app: 'after-login',
        jwtToken: action.token
      })
    case RIDE_SAVED:
      return Object.assign({}, state, {
        rides: [action.ride, ...state.rides]
      })
    case RIDES_FETCHED:
      return Object.assign({}, state, {
        rides: action.rides
      })
    default:
      return state
  }
}