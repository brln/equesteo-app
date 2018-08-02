import { fromJS, List, Map } from 'immutable'
import { AsyncStorage } from 'react-native'

export default class LocalStorage {
  static TOKEN_KEY = '@equesteo:jwtToken'
  static LOCAL_STATE_KEY = '@equesteo:localState'

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
    return await AsyncStorage.removeItem(LocalStorage.TOKEN_KEY);
  }

  static async saveLocalState (dataAsObject) {
    return AsyncStorage.setItem(LocalStorage.LOCAL_STATE_KEY, JSON.stringify(dataAsObject))
  }

  static async loadLocalState () {
    const asString = await AsyncStorage.getItem(LocalStorage.LOCAL_STATE_KEY);
    if (asString) {
      const asObj = JSON.parse(asString)
      return fromJS(asObj)
    }
  }

  static async deleteLocalState () {
    return await AsyncStorage.removeItem(LocalStorage.LOCAL_STATE_KEY);
  }
}