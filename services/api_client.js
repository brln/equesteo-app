import { API_URL } from 'react-native-dotenv'
import { logError } from '../helpers'
import {BadRequestError, UnauthorizedError, NotConnectedError} from '../errors'

export default class ApiClient {
  GET = 'get'
  POST = 'post'
  PUT = 'put'

  constructor(token){
    this.token = token
  }

  headers (isJson) {
    let headers = {
     'Authorization': 'Bearer: ' + this.token,
    }
    if (isJson) {
      headers['Content-Type'] = 'application/json'
    }
    return new Headers(headers)
  }

  get (endpoint) {
    return this.request(this.GET, endpoint)
  }

  post (endpoint, body) {
    return this.request(this.POST, endpoint, body)
  }

  put (endpoint, body) {
    return this.request(this.PUT, endpoint, body)
  }

  request (method, endpoint, body, isJSON=true) {
    if (isJSON) {
      body = body ? JSON.stringify(body) : undefined
    }
    return fetch(
      API_URL + endpoint,
      {
        body,
        headers: this.headers(isJSON),
        method
      }
    ).then(resp => {
      return resp.json().then(json => {
        switch (resp.status) {
          case 400:
            throw new BadRequestError(json.error)
          case 401:
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

  uploadImage (endpoint, photoID, imageLocation) {
    const data = new FormData()
    const name = `${photoID}.jpg`
    data.append('file', {
      name,
      uri: imageLocation,
      type: 'image/jpeg',
    })
    return this.request(this.POST, endpoint, data, false)
  }
}