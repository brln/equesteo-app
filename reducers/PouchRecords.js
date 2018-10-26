import { fromJS, Map } from 'immutable'
import {
  CREATE_RIDE,
  DELETE_UNPERSISTED_RIDE,
  FOLLOW_UPDATED,
  HORSE_CREATED,
  HORSE_USER_UPDATED,
  HORSE_SAVED,
  LOCAL_DATA_LOADED,
  RIDE_COMMENT_CREATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_ELEVATIONS_CREATED,
  RIDE_UPDATED,
  RIDE_ELEVATIONS_UPDATED,
  USER_UPDATED,
} from '../constants'
import { elapsedTime, newRideName, staticMap } from '../helpers'
import { simplifyLine } from '../services/DouglasPeucker'

export const initialState = Map({
  horses: Map(),
  horseUsers: Map(),
  follows: Map(),
  rides: Map(),
  rideCarrots: Map(),
  rideComments: Map(),
  rideElevations: Map(),
  users: Map(),
})

export default function PouchRecordsReducer(state=initialState, action) {
  switch (action.type) {
    case DELETE_UNPERSISTED_RIDE:
      return state.deleteIn(['rides', action.rideID]).deleteIn('rideElevations', action.rideID + '_elevations')
    case FOLLOW_UPDATED:
      return state.setIn(['follows', action.follow.get('_id')], action.follow)
    case HORSE_CREATED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case HORSE_SAVED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case HORSE_USER_UPDATED:
      return state.set('horseUsers', state.get('horseUsers').set(action.horseUser.get('_id'), action.horseUser))
    case LOCAL_DATA_LOADED:
      const allUsers = action.localData.users.reduce((accum, user) => {
        accum[user._id] = fromJS(user)
        return accum
      }, {})

      const allFollows = action.localData.follows.reduce((accum, follow) => {
        accum[follow._id] = fromJS(follow)
        return accum
      }, {})

      const allHorses = action.localData.horses.reduce((accum, horse) => {
        accum[horse._id] = fromJS(horse)
        return accum
      }, {})

      const allHorseUsers = action.localData.horseUsers.reduce((accum, horseUser) => {
        accum[horseUser._id] = fromJS(horseUser)
        return accum
      }, {})

      const allRides = action.localData.rides.reduce((accum, ride) => {
        accum[ride._id] = fromJS(ride)
        return accum
      }, {})

      const allCarrots = action.localData.rideCarrots.reduce((accum, carrot) => {
        accum[carrot._id] = fromJS(carrot)
        return accum
      }, {})

      const allComments = action.localData.rideComments.reduce((accum, comment) => {
        accum[comment._id] = fromJS(comment)
        return accum
      }, {})

      const allRideElevations = action.localData.rideElevations.reduce((accum, elevation) => {
        accum[elevation._id] = fromJS(elevation)
        return accum
      }, {})

      return state.merge(Map({
        users: Map(allUsers),
        follows: Map(allFollows),
        rides: Map(allRides),
        rideCarrots: Map(allCarrots),
        rideComments: Map(allComments),
        rideElevations: Map(allRideElevations),
        horses: Map(allHorses),
        horseUsers: Map(allHorseUsers)
      }))
    case RIDE_CARROT_CREATED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_CARROT_SAVED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_COMMENT_CREATED:
      return state.setIn(['rideComments', action.rideComment.get('_id')], action.rideComment)
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
        if (hu.get('rideDefault')) {
          defaultID = hu.get('horseID')
        }
      })

      const TEN_FEET_AS_DEG_LATITUDE = 0.0000274
      const simplifiedCoords = simplifyLine(
        TEN_FEET_AS_DEG_LATITUDE,
        action.currentRide.get('rideCoordinates')
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
        rideCoordinates: simplifiedCoords,
        startTime: action.currentRide.get('startTime'),
        type: 'ride',
        userID: action.userID,
      }
      theRide.mapURL = staticMap(theRide)

      const elevationData = {
        _id: action.rideID + '_elevations',
        rideID: theRide._id,
        elevationGain: action.currentRideElevations.get('elevationGain'),
        elevations: action.currentRideElevations.get('elevations'),
        type: 'rideElevations',
        userID: action.userID,
      }
      return state.setIn(
        ['rides', theRide._id], Map(theRide)
      ).setIn(
        ['rideElevations', elevationData._id], Map(elevationData),
      )
    case RIDE_ELEVATIONS_CREATED:
      return state.setIn(['rideElevations', action.elevationData.get('_id')], action.elevationData)
    case RIDE_UPDATED:
      return state.setIn(['rides', action.ride.get('_id')], action.ride)
    case RIDE_ELEVATIONS_UPDATED:
      return state.setIn(['rideElevations', action.rideElevations.get('_id')], action.rideElevations)
    case USER_UPDATED:
      return state.setIn(['users', action.userData.get('_id')], action.userData)
    default:
      return state
  }
}
