import { AsyncStorage } from 'react-native'

export default class LocalStorage {
  static TOKEN_KEY = '@equesteo:jwtToken'

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
}