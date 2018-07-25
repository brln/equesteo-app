import ImagePicker from 'react-native-image-crop-picker'

import { changeHorsePhotoData, changeRidePhotoData, changeUserPhotoData, photoPersistComplete } from '../actions'
import { horsePhotoURL, logInfo, logError, profilePhotoURL, ridePhotoURL } from '../helpers'
import UserAPI from '../services/user_api'
import { dequeuePhoto } from '../photoQueue'

let queue = []
let savingRemotely = false

export default uploadPhotos = store => dispatch => action => {
  dispatch(action)
  const currentState = store.getState().get('main')
  const localState = currentState.get('localState')
  const needsPhotoUploads = localState.get('needsPhotoUploads')
  const needsAnyPhotoUpload = needsPhotoUploads.valueSeq().filter(x => x).count() > 0
  const jwt = localState.get('jwt')
  const goodConnection = localState.get('goodConnection')
  if (needsAnyPhotoUpload && jwt && goodConnection) {
    let userAPI = new UserAPI(jwt)
    for (let type of needsPhotoUploads.keySeq()) {
      if (needsPhotoUploads.get(type)) {
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
    logInfo('photo upload error')
    logError(e)
  })
}
