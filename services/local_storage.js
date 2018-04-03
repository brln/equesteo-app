import { AsyncStorage } from 'react-native'

export default class LocalStorage {
  static TOKEN_KEY = '@equesteo:jwtToken'
  static LOCAL_RIDES_KEY = '@equesteo:localRides'

  static randomID () {
    return Math.random().toString(36).substring(7);
  }

  static async saveToken (token) {
    return await AsyncStorage.setItem(LocalStorage.TOKEN_KEY, token);
  }

  static async loadToken () {
     return await AsyncStorage.getItem(LocalStorage.TOKEN_KEY);
  }

  static async deleteToken () {
    return await AsyncStorage.removeItem(TOKEN_KEY);
  }

  static async saveRideLocally (ride) {
    let localRides = await AsyncStorage.getItem(LocalStorage.LOCAL_RIDES_KEY)
    if (!localRides) {
      localRides = '{}'
    }
    let parsed = JSON.parse(localRides)
    parsed[ride.localID] = ride
    return await AsyncStorage.setItem(LocalStorage.LOCAL_RIDES_KEY, JSON.stringify(parsed))
  }

  static async removeLocalRide (ride) {
    let localRides = await AsyncStorage.getItem(LocalStorage.LOCAL_RIDES_KEY)
    let parsed = JSON.parse(localRides)
    delete parsed[ride.localID]
    return await AsyncStorage.setItem(LocalStorage.LOCAL_RIDES_KEY, JSON.stringify(parsed))
  }

  //@TODO: watch network and check for any locally saved rides on reconnect
  //@TODO: show locally saved rides in the feed and show whether they've synced

}