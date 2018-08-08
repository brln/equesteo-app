import PushNotification from 'react-native-push-notification'

export default async (m) => {
  const userID = m.data.userID
  const rideID = m.data.rideID
  const userName = m.data.userName
  const distance = parseFloat(m.data.distance)
  const message = `${userName} went for a ${distance.toFixed(1)} mile ride!`
  PushNotification.localNotification({
    message: message,
  })
  return Promise.resolve();
}