import { RECEIVE_JWT, RIDE_SAVED } from './constants'

const initialState = {
  app: 'login',
  jwtToken: null,
  rides: [],
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case RECEIVE_JWT:
      return Object.assign({}, state, {
        app: 'after-login',
        jwtToken: action.token
      })
    case RIDE_SAVED:
      return Object.assign({}, state, {
        rides: [...state.rides, action.ride]
      })
    default:
      return state
  }
}