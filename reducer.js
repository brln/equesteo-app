import { fromJS, List, Map } from 'immutable'

import {
  CLEAR_LAST_LOCATION,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DEQUEUE_PHOTO,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_CREATED,
  HORSE_SAVED,
  JUST_FINISHED_RIDE_SHOWN,
  LOAD_LOCAL_STATE,
  LOCAL_DATA_LOADED,
  MARK_PHOTO_ENQUEUED,
  NEEDS_REMOTE_PERSIST,
  NEW_APP_STATE,
  NEW_LOCATION,
  NEW_NETWORK_STATE,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  REMOVE_RIDE_FROM_STATE,
  RIDE_COMMENT_CREATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_CREATED,
  RIDE_SAVED,
  SAVE_USER_ID,
  SET_APP_ROOT,
  START_RIDE,
  TOGGLE_AWAITING_PW_CHANGE,
  TOGGLE_DOING_INITIAL_LOAD,
  SYNC_COMPLETE,
  USER_SEARCH_RETURNED,
  USER_UPDATED,
} from './constants'
import {
  appStates,
  goodConnection,
  haversine
} from './helpers'
import { FEED } from './screens'

const initialState = Map({
  localState: Map({
    appState: appStates.active,
    awaitingPWChange: false,
    clearStateAfterPersist: false,
    currentScreen: FEED,
    currentRide: null,
    doingInitialLoad: false,
    error: null,
    goodConnection: false,
    justFinishedRide: false,
    jwt: null,
    lastLocation: null,
    needsRemotePersist: Map({
      horses: false,
      rides: false,
      users: false,
    }),
    photoQueue: Map(),
    root: 'login',
    userID: null,
    userSearchResults: List(),
  }),
  horses: Map(),
  follows: Map(),
  lastFullSync: null,
  rides: Map(),
  rideCarrots: Map(),
  rideComments: Map(),
  users: Map(),
})

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_LAST_LOCATION:
      return state.setIn(['localState', 'lastLocation'], null)
    case CLEAR_SEARCH:
      return state.setIn(['localState', 'userSearchResults'], List())
    case CLEAR_STATE:
      return initialState.setIn(
        ['localState', 'goodConnection'],
        state.getIn('localState', 'goodConnection')
      )
    case CLEAR_STATE_AFTER_PERSIST:
      return state.setIn(['localState', 'clearStateAfterPersist'], true)
    case DEQUEUE_PHOTO:
      return state.deleteIn(['localState', 'photoQueue', action.photoID])
    case DISCARD_RIDE:
      return state.setIn(['localState', 'currentRide'], null)
    case DISMISS_ERROR:
      return state.setIn(['localState', 'error'], null)
    case ENQUEUE_PHOTO:
      return state.setIn(['localState', 'photoQueue', action.queueItem.get('photoID')], action.queueItem)
    case ERROR_OCCURRED:
      return state.setIn(['localState', 'error'], action.message)
    case FOLLOW_UPDATED:
      return state.setIn(['follows', action.follow.get('_id')], action.follow)
    case HORSE_CREATED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case HORSE_SAVED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case JUST_FINISHED_RIDE_SHOWN:
      return state.setIn(['localState', 'justFinishedRide'], false)
    case LOAD_LOCAL_STATE:
      return state.set('localState', action.localState)
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

      return state.merge(Map({
        users: Map(allUsers),
        follows: Map(allFollows),
        rides: Map(allRides),
        rideCarrots: Map(allCarrots),
        rideComments: Map(allComments),
        horses: Map(allHorses),
      }))
    case MARK_PHOTO_ENQUEUED:
      return state.setIn(['localState', 'photoQueue', action.queueItemID, 'queueID'], action.queueID)
    case NEEDS_REMOTE_PERSIST:
      return state.setIn(['localState', 'needsRemotePersist', action.database], true)
    case NEW_APP_STATE:
      return state.setIn(['localState', 'appState'], action.newState)
    case NEW_LOCATION:
      const newState = state.setIn(['localState', 'lastLocation'], action.location)
      const currentRide = state.getIn(['localState', 'currentRide'])
      if (currentRide) {
        let newDistance = 0
        const lastLocation = state.getIn(['localState', 'lastLocation'])
        if (lastLocation) {
          newDistance = haversine(
            lastLocation.get('latitude'),
            lastLocation.get('longitude'),
            action.location.get('latitude'),
            action.location.get('longitude')
          )
        }
        const rideCoordinates = state.getIn(
          ['localState', 'currentRide', 'rideCoordinates']
        ).push(
          action.location
        ).sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        const totalDistance = currentRide.get('distance') + newDistance
        const newCurrentRide = currentRide.merge(Map({rideCoordinates, distance: totalDistance}))
        return newState.setIn(['localState', 'currentRide'], newCurrentRide)
      } else {
        return newState
      }
    case NEW_NETWORK_STATE:
      return state.setIn(
        ['localState', 'goodConnection'],
        goodConnection(
          action.connectionType,
          action.effectiveConnectionType
        )
      )
    case RECEIVE_JWT:
      return state.setIn(['localState', 'jwt'], action.token)
    case REMOTE_PERSIST_COMPLETE:
      return state.setIn(['localState', 'needsRemotePersist', action.database], false)
    case REMOVE_RIDE_FROM_STATE:
      return state.remove(action.rideID)
    case RIDE_CARROT_CREATED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_CARROT_SAVED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_COMMENT_CREATED:
      return state.setIn(['rideComments', action.rideComment.get('_id')], action.rideComment)
    case RIDE_CREATED:
      return state.setIn(
        ['rides', action.ride.get('_id')], action.ride
      ).setIn(
        ['localState', 'justFinishedRide'], true
      ).setIn(
        ['localState', 'currentRide'], null
      )
    case RIDE_SAVED:
      return state.setIn(['rides', action.ride.get('_id')], action.ride)
    case SAVE_USER_ID:
      return state.setIn(
        ['localState', 'userID'], action.userID
      )
    case SET_APP_ROOT:
      return state.setIn(['localState', 'root'], action.root)
    case START_RIDE:
      return state.setIn(['localState', 'currentRide'], action.currentRide)
    case SYNC_COMPLETE:
      return state.setIn(['localState', 'lastFullSync'], new Date())
    case TOGGLE_AWAITING_PW_CHANGE:
      return state.setIn(
        ['localState', 'awaitingPWChange'],
        !state.getIn(['localState', 'awaitingPWChange'])
      )
    case TOGGLE_DOING_INITIAL_LOAD:
      return state.setIn(
        ['localState', 'doingInitialLoad'],
        !state.getIn(['localState', 'doingInitialLoad'])
      )
    case USER_UPDATED:
      return state.setIn(['users', action.userData.get('_id')], action.userData)
    case USER_SEARCH_RETURNED:
      return state.setIn(['localState', 'userSearchResults'], action.userSearchResults)
    default:
      return state
  }
}