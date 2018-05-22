import ImagePicker from 'react-native-image-crop-picker'

import { changeHorsePhotoData, changeRidePhotoData, changeUserPhotoData, photoPersistComplete } from '../actions'
import { horsePhotoURL, profilePhotoURL, ridePhotoURL } from '../helpers'
import UserAPI from '../services/user_api'
import { dequeuePhoto } from '../photoQueue'

let queue = []
let savingRemotely = false

export default uploadPhotos = store => dispatch => action => {
  dispatch(action)
  let currentState = store.getState()
  const needsPersist = Object.values(currentState.localState.needsPhotoUploads).filter((x) => x).length > 0
  if (needsPersist && currentState.localState.jwt && currentState.localState.goodConnection) {
    let userAPI = new UserAPI(currentState.localState.jwt)
    for (let type of Object.keys(currentState.localState.needsPhotoUploads)) {
      if (currentState.localState.needsPhotoUploads[type]) {
        let nextItem = dequeuePhoto(type)
        while (nextItem) {
          if (savingRemotely) {
            queue.push(nextItem)
          } else {
            recursiveEmptyQueue(nextItem, store, userAPI)
          }
          nextItem = dequeuePhoto(type)
        }

      }
    }
  }
}

function recursiveEmptyQueue (item, store, userAPI) {
  savingRemotely = true
  remotePersist(item, store, userAPI)
}

function remotePersist (item, store, userAPI) {
  userAPI.uploadPhoto(item.type, item.filepath, item.photoID).then(() => {
    switch (item.type) {
      case 'horse':
        const uploadedHorseURI = horsePhotoURL(item.photoID)
        store.dispatch(changeHorsePhotoData(item.horseID, item.photoID, uploadedHorseURI))
        break
      case 'ride':
        const uploadedRideURI = ridePhotoURL(item.photoID)
        store.dispatch(changeRidePhotoData(item.rideID, item.photoID, uploadedRideURI))
        break
      case 'profile':
        const uploadedProfilePhotoURI = profilePhotoURL(item.photoID)
        store.dispatch(changeUserPhotoData(item.photoID, uploadedProfilePhotoURI))
        break
      default:
        throw Error('cant persist type i dont know about')
    }
    ImagePicker.cleanSingle(item.filepath)

    if (queue.length) {
      const item = queue.shift()
      recursiveEmptyQueue(item, store, userAPI)
    } else {
      store.dispatch(photoPersistComplete())
      savingRemotely = false
    }
  }).catch((e) => {
    queue = []
    savingRemotely = false
    console.log('photo upload error')
    console.log(e)
  })
}
