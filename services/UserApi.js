export default class UserAPI {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  getPWCode (email) {
    return this.apiClient.post('/users/getPWCode', {
      email: email
    })
  }

  login (email, password) {
    return this.apiClient.post('/users/login', {
      email: email,
      password: password,
    })
  }

  renewToken () {
    return this.apiClient.get('/users/renewToken')
  }

  signup (email, password) {
    return this.apiClient.post('/users', {
      email: email,
      password: password,
    })
  }

  changePassword (newPassword) {
    return this.apiClient.post('/users/changePW', {
      password: newPassword
    })
  }

  exchangePWCodeForToken (email, code) {
    return this.apiClient.post('/users/exchangePWCode', { email, code })
  }

  setFCMToken (id, token) {
    return this.apiClient.post('/users/setFCMToken', { id, token })
  }

  setDistribution (id, distribution) {
    return this.apiClient.post('/users/setDistribution', { id, distribution })
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

  findUser (searchPhrase) {
    return this.apiClient.get('/users/search?q=' + searchPhrase)
  }
}