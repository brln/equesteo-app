import { List, Map } from 'immutable'

import { FEED, SIGNUP_LOGIN } from '../screens'
import { appStates, goodConnection } from '../helpers'

import {
  AWAIT_FULL_SYNC,
  CLEAR_FEED_MESSAGE,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DEQUEUE_PHOTO,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  LOAD_LOCAL_STATE,
  NEEDS_REMOTE_PERSIST,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  POP_SHOW_RIDE_SHOWN,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  REMOTE_PERSIST_ERROR,
  REMOTE_PERSIST_STARTED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
  SET_FULL_SYNC_FAIL,
  SET_POP_SHOW_RIDE,
  SET_SHOWING_RIDE,
  SHOW_POP_SHOW_RIDE,
  SET_AWAITING_PW_CHANGE,
  SET_DOING_INITIAL_LOAD,
  SYNC_COMPLETE,
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
  jwt: null,
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
  remotePersistActive: false,
  root: SIGNUP_LOGIN,
  showingRideID: null,
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
      return loadedState.set('feedMessage', null).set('doingInitialLoad', false).set('showingRideID', null)
    case NEEDS_REMOTE_PERSIST:
      return state.setIn(['needsRemotePersist', action.database], true)
    case NEW_APP_STATE:
      return state.set('appState', action.newState)
    case NEW_NETWORK_STATE:
      return state.set(
        'goodConnection',
        goodConnection(
          action.connectionType,
          action.effectiveConnectionType
        )
      )
    case RECEIVE_JWT:
      return state.set('jwt', action.token)
    case REMOTE_PERSIST_COMPLETE:
      let dbSwitched = state.setIn(
        ['needsRemotePersist', action.database],
        false
      )
      const allDone = dbSwitched.get(
        'needsRemotePersist'
      ).valueSeq().filter(x => x).count() === 0
      if (allDone) {
        dbSwitched = dbSwitched.set('remotePersistActive', false)
      }
      return dbSwitched
    case REMOTE_PERSIST_ERROR:
      return state.set('remotePersistActive', false)
    case REMOTE_PERSIST_STARTED:
      return state.set('remotePersistActive', true)
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
    case SHOW_POP_SHOW_RIDE:
      return state.set('popShowRideNow', true)
    case SET_SHOWING_RIDE:
      return state.set('showingRideID', action.rideID)
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
    case USER_SEARCH_RETURNED:
      return state.set('userSearchResults', action.userSearchResults)
    default:
      return state
  }
}
