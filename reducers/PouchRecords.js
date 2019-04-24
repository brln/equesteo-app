import { fromJS, Map } from 'immutable'
import {
  CARE_EVENT_UPDATED,
  CLEAR_SELECTED_RIDE_COORDINATES,
  CLEAR_STATE,
  CREATE_FOLLOW,
  CREATE_HORSE,
  CREATE_HORSE_PHOTO,
  CREATE_RIDE,
  CREATE_USER_PHOTO,
  DELETE_FOLLOW,
  DELETE_UNPERSISTED_HORSE,
  DELETE_UNPERSISTED_RIDE,
  DELETE_UNPERSISTED_PHOTO,
  FOLLOW_UPDATED,
  HORSE_CARE_EVENT_UPDATED,
  HORSE_PHOTO_UPDATED,
  HORSE_USER_UPDATED,
  HORSE_UPDATED,
  LOCAL_DATA_LOADED,
  NOTIFICATION_UPDATED,
  RIDE_ATLAS_ENTRY_UPDATED,
  RIDE_COMMENT_UPDATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COORDINATES_LOADED,
  RIDE_HORSE_UPDATED,
  RIDE_PHOTO_UPDATED,
  RIDE_UPDATED,
  RIDE_ELEVATIONS_LOADED,
  UPDATE_NEW_RIDE_COORDS,
  UPDATE_NEW_RIDE_ELEVATIONS,
  USER_PHOTO_UPDATED,
  USER_UPDATED,
} from '../constants'
import {
  elapsedTime,
  feetToMeters,
  newRideName,
  parseElevationData,
  staticMap,
  unixTimeNow
} from '../helpers'
import { simplifyLine } from '../services/DouglasPeucker'

export const initialState = Map({
  careEvents: Map(),
  horses: Map(),
  horsePhotos: Map(),
  horseUsers: Map(),
  follows: Map(),
  horseCareEvents: Map(),
  leaderboards: Map(),
  notifications: Map(),
  rides: Map(),
  rideCarrots: Map(),
  selectedRideCoordinates: null,
  selectedRideElevations: null,
  rideAtlasEntries: Map(),
  rideComments: Map(),
  rideHorses: Map(),
  ridePhotos: Map(),
  trainings: Map(),
  users: Map(),
  userPhotos: Map(),
})

const createHorse = (action, state) => {
  const newHorse = {
    _id: action.horseID,
    breed: null,
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    createTime: unixTimeNow(),
    description: null,
    heightHands: null,
    heightInches: null,
    name: null,
    profilePhotoID: null ,
    photosByID: Map(),
    sex: null ,
    type: 'horse',
  }

  let isFirstHorse = state.get('horseUsers').valueSeq().filter((hu) => {
    return hu.get('userID') === action.userID && hu.get('deleted') !== true
  }).count() === 0
  const newHorseUser = {
    _id: action.horseUserID,
    type: 'horseUser',
    horseID: newHorse._id,
    userID: action.userID,
    owner: true,
    createTime: unixTimeNow(),
    deleted: false,
    rideDefault: isFirstHorse,
  }
  return state.setIn(
    ['horses', newHorse._id],
    Map(newHorse)
  ).setIn(
    ['horseUsers', newHorseUser._id],
    Map(newHorseUser)
  )
}

const createFollow = (action, state) => {
  let found = state.getIn(['follows', action.followID])
  if (!found) {
    found = Map({
      _id: action.followID,
      followingID: action.followingID,
      followerID: action.followerID,
      deleted: false,
      type: "follow"
    })
  } else {
    found = found.set('deleted', false)
  }
  return state.setIn(
    ['follows', action.followID],
    found
  )
}

const createRide = (action, state) => {
  let newState = state
  const startTime = action.currentRide.get('startTime')

  let finishTime = new Date()
  let pausedTime = action.currentRide.get('pausedTime')
  let lastPausedTime = action.currentRide.get('lastPauseStart')
  if (action.duplicateFrom) {
    finishTime = new Date(action.currentRide.get('startTime'))
    finishTime.setSeconds(action.currentRide.get('elapsedTimeSecs'))
    pausedTime = 0
    lastPausedTime = false
  }

  const elapsed = elapsedTime(
    startTime,
    finishTime,
    pausedTime,
    lastPausedTime
  )

  const name = newRideName(action.currentRide)

  let defaultID = null
  if (!action.duplicateFrom) {
    state.get('horseUsers').valueSeq().forEach((hu) => {
      if (hu.get('userID') === action.userID && hu.get('rideDefault')) {
        defaultID = hu.get('horseID')
      }
    })
  }

  if (defaultID) {
    const recordID = `${action.rideID}_${defaultID}_${'rider'}`
    const newRideHorse = Map({
      _id: recordID,
      rideID: action.rideID,
      horseID: defaultID,
      rideHorseType: 'rider',
      type: 'rideHorse',
      timestamp: unixTimeNow(),
      userID: action.userID,
    })
    newState = newState.setIn(['rideHorses', recordID], newRideHorse)
  }

  const TEN_FEET_AS_DEG_LATITUDE = 0.0000274
  const simplifiedCoords = simplifyLine(
    TEN_FEET_AS_DEG_LATITUDE,
    action.currentRideCoordinates.get('rideCoordinates')
  )

  const theRide = {
    _id: action.rideID,
    coverPhotoID: null,
    distance: action.currentRide.get('distance') ,
    elapsedTimeSecs: elapsed,
    horseID: defaultID,
    isPublic: state.getIn(['users', action.userID, 'ridesDefaultPublic']),
    name,
    notes: null,
    photosByID: Map({}),
    startTime: action.currentRide.get('startTime'),
    type: 'ride',
    userID: action.userID,
    duplicateFrom: action.duplicateFrom,
  }


  const simplifiedElevationData = parseElevationData(
    simplifiedCoords,
    action.currentRideElevations.get('elevations')
  )
  const elevationGain = feetToMeters(simplifiedElevationData[simplifiedElevationData.length - 1].gain)
  const elevationData = {
    _id: action.rideID + '_elevations',
    rideID: theRide._id,
    elevationGain,
    elevations: action.currentRideElevations.get('elevations'),
    type: 'rideElevations',
    userID: action.userID,
  }

  const coordinateData = {
    _id: action.rideID + '_coordinates',
    rideID: theRide._id,
    userID: action.userID,
    type: 'rideCoordinates',
    rideCoordinates: simplifiedCoords,
  }
  theRide.mapURL = staticMap(theRide, coordinateData.rideCoordinates)

  const coordMap = Map(coordinateData)
  const elevMap = Map(elevationData)
  return newState.setIn(
    ['rides', theRide._id], Map(theRide)
  ).set(
    'selectedRideCoordinates',
    coordMap
  ).set(
    'selectedRideElevations',
    elevMap
  )
}

const localDataLoaded = (action, state) => {
  return state.merge(Map({
    leaderboards: fromJS(action.localData.leaderboards),
    trainings: fromJS(action.localData.trainings),

    careEvents: fromJS(action.localData.careEvents).merge(state.get('careEvents')),
    follows: fromJS(action.localData.follows).merge(state.get('follows')),
    horseCareEvents: fromJS(action.localData.horseCareEvents).merge(state.get('horseCareEvents')),
    horses: fromJS(action.localData.horses).merge(state.get('horses')),
    horsePhotos: fromJS(action.localData.horsePhotos).merge(state.get('horsePhotos')),
    horseUsers: fromJS(action.localData.horseUsers).merge(state.get('horseUsers')),
    notifications: fromJS(action.localData.notifications).merge(state.get('notifications')),
    rides: fromJS(action.localData.rides).merge(state.get('rides')),
    rideComments: fromJS(action.localData.rideComments).merge(state.get('rideComments')),
    rideHorses: fromJS(action.localData.rideHorses).merge(state.get('rideHorses')),
    rideCarrots: fromJS(action.localData.rideCarrots).merge(state.get('rideCarrots')),
    ridePhotos: fromJS(action.localData.ridePhotos).merge(state.get('ridePhotos')),
    rideAtlasEntries: fromJS(action.localData.rideAtlasEntries).merge(state.get('rideAtlasEntries')),
    users: fromJS(action.localData.users).merge(state.get('users')),
    userPhotos: fromJS(action.localData.userPhotos).merge(state.get('userPhotos')),
  }))
}

export default function PouchRecordsReducer(state=initialState, action) {
  switch (action.type) {
    case CARE_EVENT_UPDATED:
      return state.setIn(['careEvents', action.careEvent.get('_id')], action.careEvent)
    case CLEAR_SELECTED_RIDE_COORDINATES:
      return state.set('selectedRideCoordinates', null)
    case CLEAR_STATE:
      return initialState
    case CREATE_FOLLOW:
      return createFollow(action, state)
    case CREATE_HORSE:
      return createHorse(action, state)
    case CREATE_HORSE_PHOTO:
      const newPhoto = {
        _id: action.photoData._id,
        horseID: action.horseID,
        timestamp: action.photoData.timestamp,
        type: 'horsePhoto',
        uri: action.photoData.uri,
        userID: action.userID,
      }
      return state.setIn(['horsePhotos', action.photoData._id], Map(newPhoto))
    case CREATE_RIDE:
      return createRide(action, state)
    case CREATE_USER_PHOTO:
      const newUserPhoto = {
        _id: action.photoData._id,
        timestamp: action.photoData.timestamp,
        type: 'userPhoto',
        uri: action.photoData.uri,
        userID: action.userID,
      }
      return state.setIn(['userPhotos', action.photoData._id], Map(newUserPhoto))
    case DELETE_FOLLOW:
      let toBeDeleted = state.getIn(['follows', action.followID])
      toBeDeleted = toBeDeleted.set('deleted', true)
      return state.setIn(
        ['follows', action.followID],
        toBeDeleted
      )
    case DELETE_UNPERSISTED_HORSE:
      return state.deleteIn(['horses', action.horseID]).deleteIn(['horseUsers', action.horseUserID])
    case DELETE_UNPERSISTED_RIDE:
      return state.deleteIn(
        ['rides', action.rideID]
      )
    case DELETE_UNPERSISTED_PHOTO:
      return state.deleteIn([action.photoSection, action.photoID])
    case FOLLOW_UPDATED:
      return state.setIn(['follows', action.follow.get('_id')], action.follow)
    case HORSE_CARE_EVENT_UPDATED:
      return state.setIn(['horseCareEvents', action.horseCareEvent.get('_id')], action.horseCareEvent)
    case HORSE_UPDATED:
      return state.setIn(['horses', action.horse.get('_id')], action.horse)
    case HORSE_USER_UPDATED:
      return state.setIn(['horseUsers', action.horseUser.get('_id')], action.horseUser)
    case HORSE_PHOTO_UPDATED:
      return state.setIn(['horsePhotos', action.horsePhoto.get('_id')], action.horsePhoto)
    case LOCAL_DATA_LOADED:
      return localDataLoaded(action, state)
    case NOTIFICATION_UPDATED:
      return state.setIn(['notifications', action.notification.get('_id')], action.notification)
    case RIDE_ATLAS_ENTRY_UPDATED:
      return state.setIn(['rideAtlasEntries', action.rideAtlasEntry.get('_id')], action.rideAtlasEntry)
    case RIDE_CARROT_CREATED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_CARROT_SAVED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_COMMENT_UPDATED:
      return state.setIn(['rideComments', action.rideComment.get('_id')], action.rideComment)
    case RIDE_COORDINATES_LOADED:
      return state.set('selectedRideCoordinates', fromJS(action.rideCoordinates))
    case RIDE_ELEVATIONS_LOADED:
      return state.set('selectedRideElevations', fromJS(action.rideElevations))
    case RIDE_HORSE_UPDATED:
      return state.setIn(['rideHorses', action.rideHorse.get('_id')], Map(action.rideHorse))
    case RIDE_PHOTO_UPDATED:
      return state.setIn(['ridePhotos', action.ridePhoto.get('_id')], action.ridePhoto)
    case RIDE_UPDATED:
      return state.setIn(['rides', action.ride.get('_id')], action.ride)
    case USER_PHOTO_UPDATED:
      return state.setIn(['userPhotos', action.userPhoto.get('_id')], action.userPhoto)
    case USER_UPDATED:
      return state.setIn(['users', action.userData.get('_id')], action.userData)
    default:
      return state
  }
}
