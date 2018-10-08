import ImagePicker from 'react-native-image-crop-picker'
import { Sentry } from 'react-native-sentry'

import {
  changeHorsePhotoData,
  changeRidePhotoData,
  changeUserPhotoData,
  dequeuePhoto,
} from '../actions'
import {
  generateUUID,
  horsePhotoURL,
  logInfo,
  logError,
  profilePhotoURL,
  ridePhotoURL
} from '../helpers'
import UserAPI from '../services/user_api'

let queueID = generateUUID()
let workingQueue = []
let currentlySaving = null

export default uploadPhotos = store => dispatch => action => {
  dispatch(action)
  const localState = store.getState().getIn(['main', 'localState'])
  const needsPhotoUploads = localState.get('photoQueue').count() > 0
  const jwt = localState.get('jwt')
  const goodConnection = localState.get('goodConnection')
  if (needsPhotoUploads && jwt && goodConnection) {
    localState.get('photoQueue').forEach((queueItem, _) => {
      if (workingQueue.indexOf(queueItem) < 0 && currentlySaving !== queueItem.get('photoID')) {
        if (currentlySaving !== null) {
          workingQueue.push(queueItem)
        } else {
          const userAPI = new UserAPI(jwt)
          recursiveEmptyQueue(queueItem, store, userAPI)
        }
      }
    })
  }
}

function recursiveEmptyQueue (item, store, userAPI) {
  currentlySaving = item.get('photoID')
  remotePersist(item, store, userAPI)
}

function remotePersist (item, store, userAPI) {
  const photoID = item.get('photoID')
  userAPI.uploadPhoto(item.get('type'), item.get('photoLocation'), photoID).then(() => {
    logInfo('photo upload success')
    store.dispatch(dequeuePhoto(photoID))
    switch (item.get('type')) {
      case 'horse':
        const uploadedHorseURI = horsePhotoURL(photoID)
        store.dispatch(changeHorsePhotoData(item.get('horseID'), photoID, uploadedHorseURI))
        break
      case 'ride':
        const uploadedRideURI = ridePhotoURL(photoID)
        store.dispatch(changeRidePhotoData(item.get('rideID'), photoID, uploadedRideURI))
        break
      case 'profile':
        const uploadedProfilePhotoURI = profilePhotoURL(photoID)
        store.dispatch(changeUserPhotoData(photoID, uploadedProfilePhotoURI))
        break
      default:
        throw Error('cant persist type I don\'t know about')
    }
    ImagePicker.cleanSingle(item.get('photoLocation'))

    if (workingQueue.length) {
      const item = workingQueue.shift()
      currentlySaving = item.get('photoID')
      recursiveEmptyQueue(item, store, userAPI)
    } else {
      currentlySaving = null
    }
  }).catch((e) => {
    try {
      Sentry.captureException(new Error(e))
    } catch (e) { logError(e) }
    workingQueue = []
    queueID = generateUUID()
    currentlySaving = null
    logError(e)
  })
}
