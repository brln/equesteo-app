export function makeMessage (notification) {
  switch (notification.notificationType) {
    case 'newRide':
      const userName = notification.userName
      const rideName = notification.name
      const distance = parseFloat(notification.distance)
      return `${userName} went for a ${distance.toFixed(1)} mile ride: ${rideName}`
    case 'newComment':
      return `${notification.commenterName} commented: ${notification.comment}`
    case 'newCarrot':
      return `${notification.carroterName || 'Someone'} gave you a carrot!`
  }
}