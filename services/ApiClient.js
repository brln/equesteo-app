import RNFetchBlob from 'rn-fetch-blob'

import config from '../dotEnv'
import {
  BadRequestError,
  BadResponseError,
  NotConnectedError,
  UnauthorizedError,
  UserAlreadyExistsError
} from '../errors'
import LocalStorage from './LocalStorage'
import { captureException } from './Sentry'
import TimeoutManager from './TimeoutManager'

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
      console.log(`Trying to set null token from ${url}`)
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

  static checkConnection() {
    return Promise.race([
      new Promise((res) => {
        return ApiClient.simpleGet('/checkConnection2').then(resp => {
          if (resp) {
            res(resp)
          } else {
            res({connected: false})
          }
        }).catch(e => {
          res({connected: false})
        })
      }),
      new Promise((res) => {
        TimeoutManager.newTimeout(() => {
          res({connected: false})
        }, 3000)
      })
    ])
  }

  static simpleGet (endpoint) {
    let resp
    return fetch(config.API_URL + endpoint, { method: 'GET' }).then(_resp => {
      resp = _resp
      return resp.json()
    }).then(json => {
      if (resp.status !== 200) {
        throw Error(JSON.stringify(json))
      }
      return json
    })
  }

  static request (method, endpoint, body, isJSON=true, doAuth=true) {
    if (isJSON) {
      body = body ? JSON.stringify(body) : undefined
    }
    let rawResp
    return this.headers(isJSON).then((headers) => {
      return fetch(
        config.API_URL + endpoint,
        {
          body,
          headers: headers,
          method
        }
      )
    }).then(resp => {
      if (resp.status >= 500) {
        throw new BadResponseError('Encountered a server problem.')
      }
      rawResp = resp
      return resp.json().then(json => {
        switch (resp.status) {
          case 400:
            throw new BadRequestError(json.error)
          case 401:
            token = null
            throw new UnauthorizedError(json.error)
          case 409:
            throw new UserAlreadyExistsError(json.error)

        }
        if (doAuth) {
          this.setToken(resp.headers.map['x-auth-token'], endpoint)
        }
        return json
      })
    }).catch(e => {
      if (e instanceof SyntaxError) {
        throw new BadResponseError('Can\'t parse response.')
      } else if (e instanceof TypeError) {
        if (e.toString() === 'TypeError: Network request failed') {
          throw new NotConnectedError('Can\'t find the server.')
        } else {
          throw e
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

  static downloadImage (imageURI) {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt : 'png'
    }).fetch('GET', imageURI).then((res) => {
      return res.path()
    })
  }
}