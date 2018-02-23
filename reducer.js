import { RECEIVE_JWT } from './constants'

const initialState = {
  jwtToken: null,
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case RECEIVE_JWT:
      return Object.assign({}, state, {
        jwtToken: action.token
      })
    default:
      return state
  }
}