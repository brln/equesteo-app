import UserAPI from './services/user_api'
import {BadRequestError, UnauthorizedError} from "./errors"

import { RECEIVE_JWT } from './constants'

function receiveJWT(token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

export function submitLogin(email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      dispatch(receiveJWT(resp.token))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
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
        console.log(e)
      }
    }
  }

}