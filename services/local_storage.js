import { fromJS } from 'immutable'
import { AsyncStorage } from 'react-native'
import { logError, logInfo } from '../helpers'

export default class LocalStorage {
  static TOKEN_KEY = '@equesteo:jwtToken'
  static LOCAL_STATE_KEY = '@equesteo:localState'
  static CURRENT_RIDE_STATE_KEY = '@equesteo:currentRide'

  static async saveToken (token, userID) {
    return await AsyncStorage.setItem(LocalStorage.TOKEN_KEY, JSON.stringify({
      token,
      userID
    }));
  }

  static async loadToken () {
    const asString = await AsyncStorage.getItem(LocalStorage.TOKEN_KEY);
    return JSON.parse(asString)
  }

  static async deleteToken () {
    logInfo('deleting JWT')
    return await AsyncStorage.removeItem(LocalStorage.TOKEN_KEY).catch(e => {
      logError(e)
      throw e
    })
  }

  static async saveLocalState (dataAsObject) {
    return AsyncStorage.setItem(LocalStorage.LOCAL_STATE_KEY, JSON.stringify(dataAsObject))
  }

  static async saveCurrentRideState (dataAsObject) {
    return AsyncStorage.setItem(LocalStorage.CURRENT_RIDE_STATE_KEY, JSON.stringify(dataAsObject))
  }

  static async loadLocalState () {
    const asString = await AsyncStorage.getItem(LocalStorage.LOCAL_STATE_KEY);
    if (asString) {
      const asObj = JSON.parse(asString)
      return fromJS(asObj)
    }
  }

  static async loadCurrentRideState () {
    const asString = await AsyncStorage.getItem(LocalStorage.CURRENT_RIDE_STATE_KEY);
    if (asString) {
      const asObj = JSON.parse(asString)
      return fromJS(asObj)
    }
  }

  static async deleteLocalState () {
    logInfo('deleting async storage local state')
    return await AsyncStorage.removeItem(LocalStorage.LOCAL_STATE_KEY).catch(e => {
      logError(e)
      throw e
    })
  }
}