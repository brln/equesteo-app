const horseQueue = []
const profileQueue = []
const rideQueue = []

export function enqueueHorsePhoto (filepath, photoID, horseID) {
  horseQueue.push({type: 'horse', filepath, photoID, horseID})
}

export function enqueueProfilePhoto (filepath, photoID) {
  profileQueue.push({type: 'profile', filepath, photoID})
}

export function enqueueRidePhoto (filepath, photoID, rideID) {
  rideQueue.push({type: 'ride', filepath, photoID, rideID})
}

export function dequeuePhoto (type) {
  switch (type) {
    case 'horse':
      return horseQueue.shift()
    case 'profile':
      return profileQueue.shift()
    case 'ride':
      return rideQueue.shift()
  }

}

