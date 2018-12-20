import { List, Map } from 'immutable'

import { FEED, SIGNUP_LOGIN } from '../screens'
import { appStates, goodConnection, unixTimeNow } from '../helpers'

import {
  AWAIT_FULL_SYNC,
  CLEAR_FEED_MESSAGE,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
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
  SET_POP_SHOW_RIDE,
  SET_REMOTE_PERSIST_DB,
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
  awaitingFullSync: false,
  clearStateAfterPersist: false,
  currentScreen: FEED,
  doingInitialLoad: false,
  error: null,
  feedMessage: null,
  firstStartHorseID: null,
  fullSyncFail: false,
  goodConnection: false,
  lastFullSync: null,
  lastLocation: null,
  locationStashingActive: false,
  moving: false,
  needsRemotePersist: Map({
    horses: false,
    rides: false,
    users: false,
  }),
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
    case AWAIT_FULL_SYNC:
      return state.set('awaitingFullSync', true)
    case CLEAR_FEED_MESSAGE:
      return state.set('feedMessage', null)
    case CLEAR_SEARCH:
      return state.set('userSearchResults', List())
    case CLEAR_STATE:
      return initialState.set('goodConnection', state.get('goodConnection'))
    case CLEAR_STATE_AFTER_PERSIST:
      return state.set('clearStateAfterPersist', true)
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
        'feedMessage', null
      ).set(
        'doingInitialLoad', false
      ).set(
        'showingRideID', null
      )
    case SET_REMOTE_PERSIST_DB:
      return state.setIn(['needsRemotePersist', action.database], action.value)
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
      const queueItem = state.getIn(['photoQueue', action.photoID])
      const updated = queueItem.set('status', action.newStatus).set('timestamp', unixTimeNow())
      return state.setIn(['photoQueue', action.photoID], updated)
    case USER_SEARCH_RETURNED:
      return state.set('userSearchResults', action.userSearchResults)
    default:
      return state
  }
}
