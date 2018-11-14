import { awaitFullSync, setPopShowRide, showLocalNotification } from '../actions'

export function handleNotification (dispatch, messageData, background) {
  switch (messageData.type) {
    case 'newRide':
      const rideID = messageData.rideID
      const userName = messageData.userName
      const distance = parseFloat(messageData.distance)
      const message = `${userName} went for a ${distance.toFixed(1)} mile ride!`
      dispatch(showLocalNotification(message, background, rideID, false))
      return
    case 'newComment':
      const commentRideID = messageData.commentRideID
      const commentMessage = `${messageData.commenterName} commented: ${messageData.comment}`
      dispatch(showLocalNotification(commentMessage, background, commentRideID, true))
      return
  }
}
