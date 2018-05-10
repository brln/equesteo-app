const horseQueue = []
const profileQueue = []

export function enqueueHorsePhoto (filepath, photoID, horseID) {
  horseQueue.push({filepath, photoID, horseID})
}

export function enqueueProfilePhoto (filepath, photoID) {
  profileQueue.push({filepath, photoID})
}

export function dequeuePhoto (type) {
  switch (type) {
    case 'horse':
      return horseQueue.shift()
    case 'profile':
      return profileQueue.shift()
  }

}

