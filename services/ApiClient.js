import { API_URL } from 'react-native-dotenv'
import { logError } from '../helpers'
import {BadRequestError, UnauthorizedError, NotConnectedError} from '../errors'
import LocalStorage from './LocalStorage'

let token = null

const GET = 'get'
const POST = 'post'
const PUT = 'put'

export default class ApiClient {
  static getToken () {
    if (!token) {
      return LocalStorage.loadToken().then(t => {
        if (t) {
          token = t.token
        }
        return token
      })
    } else {
      return Promise.resolve(token)
    }
  }

  static setToken (t) {
    if (t !== token) {
      token = t
      LocalStorage.saveToken(t)
    }
  }

  static clearToken () {
    token = null
    return LocalStorage.deleteToken()
  }

  static checkAuth() {
    return ApiClient.get('/checkAuth')
  }

  static headers (isJson) {
    return this.getToken().then(token => {
      let headers = {
       'Authorization': 'Bearer: ' + token,
      }
      if (isJson) {
        headers['Content-Type'] = 'application/json'
      }
      return new Headers(headers)
    })
  }

  static get (endpoint) {
    return ApiClient.request(GET, endpoint)
  }

  static post (endpoint, body) {
    return ApiClient.request(POST, endpoint, body)
  }

  static put (endpoint, body) {
    return ApiClient.request(PUT, endpoint, body)
  }

  static request (method, endpoint, body, isJSON=true) {
    if (isJSON) {
      body = body ? JSON.stringify(body) : undefined
    }
    return this.headers(isJSON).then((headers) => {
      return fetch(
        API_URL + endpoint,
        {
          body,
          headers: headers,
          method
        }
      )
    }).then(resp => {
      this.setToken(resp.headers.map['x-auth-token'][0])
      return resp.json().then(json => {
        switch (resp.status) {
          case 400:
            throw new BadRequestError(json.error)
          case 401:
            token = null
            throw new UnauthorizedError(json.error)
        }
        return json
      })
    }).catch(e => {
      if (e instanceof TypeError) {
        if (e.toString() === 'TypeError: Network request failed') {
          logError(e)
          throw new NotConnectedError('Cannot find the internet.')
        }
      } else {
        throw e
      }
    })
  }

  static uploadImage (endpoint, photoID, imageLocation) {
    const data = new FormData()
    const name = `${photoID}.jpg`
    data.append('file', {
      name,
      uri: imageLocation,
      type: 'image/jpeg',
    })
    return ApiClient.request(POST, endpoint, data, false)
  }
}