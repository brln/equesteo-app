import { fromJS } from 'immutable'
import { AsyncStorage } from 'react-native'
import { logError, logInfo } from '../helpers'

export default class LocalStorage {
  static TOKEN_KEY = '@equesteo:jwtToken'
  static LOCAL_STATE_KEY = '@equesteo:localState'
  static CURRENT_RIDE_STATE_KEY = '@equesteo:currentRide'

  static saveToken (token) {
    return AsyncStorage.setItem(LocalStorage.TOKEN_KEY, JSON.stringify({
      token,
    }))
  }

  static loadToken () {
    return AsyncStorage.getItem(LocalStorage.TOKEN_KEY).then(asString => {
      return JSON.parse(asString)
    })
  }

  static deleteToken () {
    logInfo('deleting JWT')
    return AsyncStorage.removeItem(LocalStorage.TOKEN_KEY)
  }


  static saveLocalState (dataAsObject) {
    return AsyncStorage.setItem(LocalStorage.LOCAL_STATE_KEY, JSON.stringify(dataAsObject))
  }

  static saveCurrentRideState (dataAsObject) {
    return AsyncStorage.setItem(LocalStorage.CURRENT_RIDE_STATE_KEY, JSON.stringify(dataAsObject))
  }

  static loadLocalState () {
    return new Promise((res, rej) => {
      AsyncStorage.getItem(LocalStorage.LOCAL_STATE_KEY).then(asString => {
        let asObj
        if (asString) {
          asObj = JSON.parse(asString)
        }
        res(fromJS(asObj))
      }).catch(e => {
        rej(e)
      })
    })

  }

  static loadCurrentRideState () {
    return new Promise((res, rej) => {
      AsyncStorage.getItem(LocalStorage.CURRENT_RIDE_STATE_KEY).then(asString => {
        let asObj
        if (asString) {
          asObj = JSON.parse(asString)
        }
        res(fromJS(asObj))
      }).catch(e => {
        rej(e)
      })
    })
  }

  static deleteLocalState () {
    logInfo('deleting async storage local state')
    return AsyncStorage.removeItem(LocalStorage.LOCAL_STATE_KEY)
  }
}