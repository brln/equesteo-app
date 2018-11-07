import ApiClient from './api_client'

export default class UserAPI {

  constructor (token) {
    this.apiClient = new ApiClient(token)
  }

  async getPWCode (email) {
    return await this.apiClient.post('/users/getPWCode', {
      email: email
    })
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

  async changePassword (newPassword) {
    return await this.apiClient.post('/users/changePW', {
      password: newPassword
    })
  }

  async exchangePWCodeForToken (email, code) {
    return await this.apiClient.post('/users/exchangePWCode', { email, code })
  }

  async setFCMToken (id, token) {
    return await this.apiClient.post('/users/setFCMToken', { id, token })
  }

  _uploadProfilePhoto (imageLocation, photoID) {
    return this.apiClient.uploadImage('/users/profilePhoto', photoID, imageLocation)
  }

  _uploadHorsePhoto (imageLocation, photoID) {
    return this.apiClient.uploadImage('/users/horsePhoto', photoID, imageLocation)
  }

  _uploadRidePhoto (imageLocation, photoID) {
    return this.apiClient.uploadImage('/users/ridePhoto', photoID, imageLocation)
  }

  uploadPhoto (type, imageLocation, photoID) {
    switch (type) {
      case 'horse':
        return this._uploadHorsePhoto(imageLocation, photoID)
      case 'user':
        return this._uploadProfilePhoto(imageLocation, photoID)
      case 'ride':
        return this._uploadRidePhoto(imageLocation, photoID)
      default:
        throw "lolwut wrong type"
    }
  }

  async findUser (searchPhrase) {
    return await this.apiClient.get('/users/search?q=' + searchPhrase)
  }
}