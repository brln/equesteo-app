import { fromJS, Map } from 'immutable'
import {
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
  HORSE_PHOTO_UPDATED,
  HORSE_USER_UPDATED,
  HORSE_UPDATED,
  LOCAL_DATA_LOADED,
  RIDE_COMMENT_UPDATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COORDINATES_LOADED,
  RIDE_ELEVATIONS_CREATED,
  RIDE_PHOTO_UPDATED,
  RIDE_UPDATED,
  RIDE_ELEVATIONS_UPDATED,
  UPDATE_NEW_RIDE_COORDS,
  USER_PHOTO_UPDATED,
  USER_UPDATED,
} from '../constants'
import { elapsedTime, newRideName, staticMap, unixTimeNow } from '../helpers'
import { simplifyLine } from '../services/DouglasPeucker'

export const initialState = Map({
  horses: Map(),
  horsePhotos: Map(),
  horseUsers: Map(),
  follows: Map(),
  newRideCoordinates: null,
  rides: Map(),
  rideCarrots: Map(),
  selectedRideCoordinates: null,
  rideComments: Map(),
  rideElevations: Map(),
  ridePhotos: Map(),
  users: Map(),
  userPhotos: Map(),
})

export default function PouchRecordsReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_SELECTED_RIDE_COORDINATES:
      return state.set('selectedRideCoordinates', null)
    case CLEAR_STATE:
      return initialState
    case CREATE_FOLLOW:
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
    case CREATE_HORSE:
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
      const startTime = action.currentRide.get('startTime')
      const now = new Date()
      const elapsed = elapsedTime(
        startTime,
        now,
        action.currentRide.get('pausedTime'),
        action.currentRide.get('lastPauseStart')
      )

      const name = newRideName(action.currentRide)

      let defaultID = null
      state.get('horseUsers').valueSeq().forEach((hu) => {
        if (hu.get('userID') === action.userID && hu.get('rideDefault')) {
          defaultID = hu.get('horseID')
        }
      })

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
      }

      const elevationData = {
        _id: action.rideID + '_elevations',
        rideID: theRide._id,
        elevationGain: action.currentRideElevations.get('elevationGain'),
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

      return state.setIn(
        ['rides', theRide._id], Map(theRide)
      ).setIn(
        ['rideElevations', elevationData._id], Map(elevationData),
      ).set(
        'newRideCoordinates',
        Map(coordinateData)
      ).set(
        'selectedRideCoordinates',
        Map(coordinateData)
      )
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
      ).deleteIn(
        ['rideElevations', action.rideID + '_elevations']
      )
    case DELETE_UNPERSISTED_PHOTO:
      return state.deleteIn([action.photoSection, action.photoID])
    case FOLLOW_UPDATED:
      return state.setIn(['follows', action.follow.get('_id')], action.follow)
    case HORSE_UPDATED:
      return state.setIn(['horses', action.horse.get('_id')], action.horse)
    case HORSE_USER_UPDATED:
      return state.setIn(['horseUsers', action.horseUser.get('_id')], action.horseUser)
    case HORSE_PHOTO_UPDATED:
      return state.setIn(['horsePhotos', action.horsePhoto.get('_id')], action.horsePhoto)
    case LOCAL_DATA_LOADED:
      const actionRecords = {
        follows: {},
        horses: {},
        horsePhotos: {},
        horseUsers: {},
        rides: {},
        rideCarrots: {},
        rideComments: {},
        ridePhotos: {},
        rideElevations: {},
        users: {},
        userPhotos: {},
      }

      for (let recordType of Object.keys(actionRecords)) {
        action.localData[recordType].reduce((accum, record) => {
          accum[record._id] = record
          return accum
        }, actionRecords[recordType])
      }
      return state.merge(Map({
        follows: fromJS(actionRecords.follows),
        // First start creates a horse, probably before the finishes,
        // so keep it from blowing the new horse away
        horses: state.get('horses').merge(fromJS(actionRecords.horses)),
        horseUsers: state.get('horseUsers').merge(fromJS(actionRecords.horseUsers)),

        horsePhotos: fromJS(actionRecords.horsePhotos),
        rides: fromJS(actionRecords.rides),
        rideCarrots: fromJS(actionRecords.rideCarrots),
        rideComments: fromJS(actionRecords.rideComments),
        rideElevations: fromJS(actionRecords.rideElevations),
        ridePhotos: fromJS(actionRecords.ridePhotos),
        users: fromJS(actionRecords.users),
        userPhotos: fromJS(actionRecords.userPhotos)
      }))
    case RIDE_CARROT_CREATED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_CARROT_SAVED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_COMMENT_UPDATED:
      return state.setIn(['rideComments', action.rideComment.get('_id')], action.rideComment)
    case RIDE_COORDINATES_LOADED:
      return state.set('selectedRideCoordinates', fromJS(action.rideCoordinates))
    case RIDE_ELEVATIONS_CREATED:
      return state.setIn(['rideElevations', action.elevationData.get('_id')], action.elevationData)
    case RIDE_PHOTO_UPDATED:
      return state.setIn(['ridePhotos', action.ridePhoto.get('_id')], action.ridePhoto)
    case RIDE_UPDATED:
      return state.setIn(['rides', action.ride.get('_id')], action.ride)
    case RIDE_ELEVATIONS_UPDATED:
      return state.setIn(['rideElevations', action.rideElevations.get('_id')], action.rideElevations)
    case UPDATE_NEW_RIDE_COORDS:
      return state.set('newRideCoordinates', action.newCoords)
    case USER_PHOTO_UPDATED:
      return state.setIn(['userPhotos', action.userPhoto.get('_id')], action.userPhoto)
    case USER_UPDATED:
      return state.setIn(['users', action.userData.get('_id')], action.userData)
    default:
      return state
  }
}
