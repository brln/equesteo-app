import { API_URL } from 'react-native-dotenv'
import { logError, logInfo } from '../helpers'
import {
  BadRequestError,
  BadResponseError,
  NotConnectedError,
  UnauthorizedError
} from '../errors'
import LocalStorage from './LocalStorage'
import { captureException, captureMessage } from './Sentry'

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

  static setToken (t, url) {
    if (t && t !== token) {
      token = t
      return LocalStorage.saveToken(t).catch(e => {
        captureException(e)
      })
    } else if (!token) {
      logError(`Trying to set null token from ${url}`)
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
    let rawResp
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
      rawResp = resp
      return resp.json().then(json => {
        switch (resp.status) {
          case 400:
            throw new BadRequestError(json.error)
          case 401:
            token = null
            throw new UnauthorizedError(json.error)
        }
        this.setToken(resp.headers.map['x-auth-token'][0], endpoint)
        return json
      })
    }).catch(e => {
      if (e instanceof SyntaxError) {
        logError(e, 'ApiClient.request')
        logInfo(rawResp)
        throw new BadResponseError('Can\'t parse response.')
      } else if (e instanceof TypeError) {
        if (e.toString() === 'TypeError: Network request failed') {
          throw new NotConnectedError('Can\'t find the internet.')
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