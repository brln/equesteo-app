import PushNotification from 'react-native-push-notification'
import { awaitFullSync, setPopShowRide } from './actions'

export default (store) => {
  return async (m) => {
    const rideID = m.data.rideID
    const userName = m.data.userName

    store.dispatch(awaitFullSync())
    store.dispatch(setPopShowRide(rideID, false))

    const distance = parseFloat(m.data.distance)
    const message = `${userName} went for a ${distance.toFixed(1)} mile ride!`
    PushNotification.localNotification({
      message: message,
    })
    return Promise.resolve();
  }

}