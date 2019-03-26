import ApiClient from './ApiClient'

export default class UserAPI {
  static getPWCode (email) {
    return ApiClient.post('/users/getPWCode', {
      email: email
    })
  }

  static login (email, password) {
    return ApiClient.post('/users/login', {
      email: email,
      password: password,
    })
  }

  static signup (email, password) {
    return ApiClient.post('/users', {
      email: email,
      password: password,
    })
  }

  static changePassword (newPassword) {
    return ApiClient.post('/users/changePW', {
      password: newPassword
    })
  }

  static sendFeedback (userID, feedback) {
    return ApiClient.post('/users/feedback', {
      id: userID,
      feedback
    })
  }

  static exchangePWCodeForToken (email, code) {
    return ApiClient.post('/users/exchangePWCode', { email, code })
  }

  static setFCMToken (id, token, platform) {
    return ApiClient.post('/users/setFCMToken', { id, token, platform })
  }

  static setDistribution (id, distribution) {
    return ApiClient.post('/users/setDistribution', { id, distribution })
  }

  static _uploadProfilePhoto (imageLocation, photoID) {
    return ApiClient.uploadImage('/photos/user', photoID, imageLocation)
  }

  static _uploadHorsePhoto (imageLocation, photoID) {
    return ApiClient.uploadImage('/photos/horse', photoID, imageLocation)
  }

  static _uploadRidePhoto (imageLocation, photoID) {
    return ApiClient.uploadImage('/photos/ride', photoID, imageLocation)
  }

  static uploadPhoto (type, imageLocation, photoID) {
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

  static getSharableRideImage (ride, rideCoordinates) {
    return ApiClient.post('/sharableMap', {
      id: ride.get('_id'),
      distance: ride.get('distance'),
      rev: ride.get('_rev'),
      rideCoordinates: rideCoordinates.get('rideCoordinates').toJS(),
      rideTime: ride.get('elapsedTimeSecs'),
      startTime: ride.get('startTime'),
      name: ride.get('name'),
    })
  }

  static findUser (searchPhrase) {
    return ApiClient.get('/users/search?q=' + searchPhrase)
  }
}