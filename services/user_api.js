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

  async updateProfile (userData) {
    return await this.apiClient.put('/users', userData)
  }

  async addFollow (followingID) {
    return await this.apiClient.post('/users/follow/add', {
      followingID
    })
  }

  async deleteFollow (followingID ) {
    return await this.apiClient.post('/users/follow/delete', {
      followingID
    })
  }

  async saveState (state) {
    return await this.apiClient.post('/users/state', state)
  }

  async getState () {
    return await this.apiClient.get('/users/state')
  }
}