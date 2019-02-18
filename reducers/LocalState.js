import { List, Map } from 'immutable'

import { FEED, SIGNUP_LOGIN } from '../screens'
import { appStates, logError, unixTimeNow } from '../helpers'
import { DB_NEEDS_SYNC, DB_SYNCING, DB_SYNCED } from "../actions/functional"

import {
  CARROT_MUTEX,
  CLEAR_FEED_MESSAGE,
  CLEAR_RIDE_PHOTO_FROM_STASH,
  CLEAR_RIDE_PHOTO_STASH,
  CLEAR_SEARCH,
  CLEAR_STATE,
  DEQUEUE_PHOTO,
  DISCARD_CURRENT_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  LOAD_LOCAL_STATE,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  POP_SHOW_RIDE_SHOWN,
  REMOVE_STASHED_RIDE_PHOTO,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
  SET_FULL_SYNC_FAIL,
  SET_LOCATION_RETRY,
  SET_POP_SHOW_RIDE,
  SET_REMOTE_PERSIST,
  SET_SHOWING_RIDE,
  SET_AWAITING_PW_CHANGE,
  SET_DOING_INITIAL_LOAD,
  SET_SIGNING_OUT,
  SHOW_POP_SHOW_RIDE,
  STASH_RIDE_PHOTO,
  SYNC_COMPLETE,
  UPDATE_PHOTO_STATUS,
  USER_SEARCH_RETURNED,
} from '../constants'

export const initialState = Map({
  activeComponent: null,
  appState: appStates.active,
  awaitingPWChange: false,
  carrotMutex: false,
  currentScreen: FEED,
  doingInitialLoad: false,
  error: null,
  feedMessage: null,
  firstStartHorseID: null,
  fullSyncFail: false,
  goodConnection: true,
  lastFullSync: null,
  locationStashingActive: false,
  locationRetry: false,
  needsRemotePersist: DB_SYNCED,
  photoQueue: Map(),
  popShowRide: null,
  popShowRideNow: null,
  ridePhotoStash: Map(),
  root: SIGNUP_LOGIN,
  showingRideID: null,
  signingOut: false,
  userID: null,
  userSearchResults: List(),
})

export default function LocalStateReducer(state=initialState, action) {
  switch (action.type) {
    case CARROT_MUTEX:
      return state.set('carrotMutex', action.value)
    case CLEAR_FEED_MESSAGE:
      return state.set('feedMessage', null)
    case CLEAR_RIDE_PHOTO_FROM_STASH:
      return state.deleteIn(['ridePhotoStash', action.stashKey, action.photoID])
    case CLEAR_RIDE_PHOTO_STASH:
      return state.deleteIn(['ridePhotoStash', action.stashKey])
    case CLEAR_SEARCH:
      return state.set('userSearchResults', List())
    case CLEAR_STATE:
      return initialState.set('goodConnection', state.get('goodConnection'))
    case DEQUEUE_PHOTO:
      return state.deleteIn(['photoQueue', action.photoID])
    case DISCARD_CURRENT_RIDE:
      return state.setIn(
        ['ridePhotoStash', 'currentRidePhotoStash'],
        Map()
      )
    case DISMISS_ERROR:
      return state.set('error', null)
    case ENQUEUE_PHOTO:
      return state.setIn(['photoQueue', action.queueItem.get('photoID')], action.queueItem)
    case ERROR_OCCURRED:
      return state.set('error', action.message)
    case SET_FULL_SYNC_FAIL:
      return state.set('fullSyncFail', action.status)
    case POP_SHOW_RIDE_SHOWN:
      return state.set('popShowRide', null).set('popShowRideNow', null)
    case LOAD_LOCAL_STATE:
      const loadedState = action.localState
      return loadedState.set(
        'carrotMutex', false,
      ).set(
        'feedMessage', null
      ).set(
        'doingInitialLoad', false
      ).set(
        'showingRideID', null
      ).set(
        'signingOut', false
      ).set(
        'needsRemotePersist', loadedState.get('needsRemotePersist') === DB_SYNCING ? DB_NEEDS_SYNC : DB_SYNCED
      )
    case SET_REMOTE_PERSIST:
      return state.set('needsRemotePersist', action.value)
    case NEW_APP_STATE:
      return state.set('appState', action.newState)
    case NEW_NETWORK_STATE:
      return state.set('goodConnection', action.goodConnection)
    case REMOVE_STASHED_RIDE_PHOTO:
      return state.deleteIn(['ridePhotoStash', action.stashKey, action.photoID])
    case SAVE_USER_ID:
      return state.set('userID', action.userID)
    case SET_ACTIVE_COMPONENT:
      return state.set('activeComponent', action.componentID)
    case SET_FEED_MESSAGE:
      return state.set('feedMessage', action.message)
    case SET_FIRST_START_HORSE_ID:
      return state.set('firstStartHorseID', Map({ horseID: action.horseID, horseUserID: action.horseUserID }))
    case SET_LOCATION_RETRY:
      return state.set('locationRetry', action.newVal)
    case SET_POP_SHOW_RIDE:
      return state.set(
        'popShowRide', Map({rideID: action.rideID, scrollToComments: action.scrollToComments})
      ).set(
        'popShowRideNow', action.showRideNow
      )
    case SET_SHOWING_RIDE:
      return state.set('showingRideID', action.rideID)
    case SET_SIGNING_OUT:
      return state.set('signingOut', action.value)
    case SHOW_POP_SHOW_RIDE:
      return state.set('popShowRideNow', true)
    case SYNC_COMPLETE:
      return state.set(
        'lastFullSync', new Date()
      ).set(
        'awaitingFullSync', false
      )
    case SET_AWAITING_PW_CHANGE:
      return state.set('awaitingPWChange', action.newVal)
    case SET_DOING_INITIAL_LOAD:
      return state.set('doingInitialLoad', action.newVal)
    case STASH_RIDE_PHOTO:
      let newState = state
      if (!state.getIn(['ridePhotoStash', action.stashKey])) {
        newState = newState.setIn(['ridePhotoStash', action.stashKey], Map())
      }
      return newState.setIn(['ridePhotoStash', action.stashKey, action.photoData.get('_id')], action.photoData)
    case UPDATE_PHOTO_STATUS:
      let updatedState = state
      const queueItem = state.getIn(['photoQueue', action.photoID])
      if (queueItem) {
        const updated = queueItem.set('status', action.newStatus).set('timestamp', unixTimeNow())
        updatedState = state.setIn(['photoQueue', action.photoID], updated)
      } else {
        logError('Updating queue item that doesn\'t exist in queue anymore')
      }
      return updatedState
    case USER_SEARCH_RETURNED:
      return state.set('userSearchResults', action.userSearchResults)
    default:
      return state
  }
}
