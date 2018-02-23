import { API_URL } from 'react-native-dotenv'
import {BadRequestError, UnauthorizedError} from '../errors'

export default class ApiClient {
  GET = 'get'
  POST = 'post'
  PUT = 'put'

  constructor(token){
    this.token = token
  }

  headers () {
    console.log(this.token)
    return new Headers({
      'Authorization': 'Bearer: ' + this.token,
      'Content-Type': 'application/json',
    })
  }

  async get (endpoint) {
    return this.request(this.GET, endpoint)
  }

  async post (endpoint, body) {
    return this.request(this.POST, endpoint, body)
  }

  async put (endpoint, body) {
    return this.request(this.PUT, endpoint, body)
  }

  async request (method, endpoint, body) {
    const resp = await fetch(
      API_URL + endpoint,
      {
        body: body ? JSON.stringify(body) : undefined,
        headers: this.headers(),
        method
      }
    )

    const json = await resp.json()
    switch (resp.status) {
      case 400:
        throw new BadRequestError(json.error)
      case 401:
        throw new UnauthorizedError(json.error)
    }
    return json

  }
}