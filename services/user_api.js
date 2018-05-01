import ApiClient from './api_client'

export default class UserAPI {

  constructor (token) {
    this.apiClient = new ApiClient(token)
  }

  async login (email, password) {
    return await this.apiClient.post('/users/login', {
      email: email,
      password: password,
    })
  }

  async signup (email, password) {
    return await this.apiClient.post('/users', {
      email: email,
      password: password,
    })
  }

  async uploadProfilePhoto (imageLocation) {
    return await this.apiClient.uploadImage('/users/profilePhoto', 'profile', imageLocation)
  }

  async findUser (searchPhrase) {
    return await this.apiClient.get('/users/search?q=' + searchPhrase)
  }

  async notifyDBUpdated (db) {
    return await this.apiClient.post('/users/updateDBNotification', {db})
  }
}