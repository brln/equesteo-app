import { List, Map } from 'immutable'

import { FEED, SIGNUP } from '../screens/consts/main'
import { appStates, logInfo, unixTimeNow } from '../helpers'
import { DB_NEEDS_SYNC, DB_SYNCING, DB_SYNCED } from "../actions/functional"

import {
  ADD_DOCS_TO_DOWNLOAD,
  ADD_DOCS_DOWNLOADED,
  ADD_NEW_CARE_HORSE_ID,
  CARROT_MUTEX,
  CHANGE_CARE_CALENDAR_TAB,
  CLEAR_CURRENT_CARE_EVENT,
  CLEAR_DOCS_NUMBERS,
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
  GPS_SIGNAL_LOST,
  LOAD_LOCAL_STATE,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  REMOVE_NEW_CARE_HORSE_ID,
  REMOVE_STASHED_RIDE_PHOTO,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_BACKGROUND_GEOLOCATION_RUNNING,
  SET_CARE_EVENT_DATE,
  SET_CARE_EVENT_SPECIFIC_DATA,
  SET_MAIN_CARE_EVENT_TYPE,
  SET_SECONDARY_CARE_EVENT_TYPE,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
  SET_FOLLOWING_SYNC_RUNNING,
  SET_FORGOT_EMAIL,
  SET_FULL_SYNC_FAIL,
  SET_REMOTE_PERSIST,
  SET_ACTIVE_ATLAS_ENTRY,
  SET_AWAITING_PW_CHANGE,
  SET_DOING_INITIAL_LOAD,
  SET_HOOF_TRACKS_ID,
  SET_HOOF_TRACKS_RUNNING,
  SET_SIGNING_OUT,
  SET_SHOWING_RIDE,
  SET_SHUTDOWN_IN_PROGRESS,
  STASH_RIDE_PHOTO,
  SYNC_COMPLETE,
  UPDATE_PHOTO_STATUS,
  USER_SEARCH_RETURNED,
} from '../constants'

const initialDocsDownloaded = Map({
  'horses': 0,
  'rides': 0,
  'users': 0,
  'notifications': 0,
})

export const initialState = Map({
  activeAtlasEntry: null,
  activeComponent: null,
  appState: appStates.active,
  awaitingPWChange: false,
  backgroundGeolocationRunning: false,
  careCalendarTab: 0,
  carrotMutex: false,
  currentScreen: FEED,
  docsToDownload: 0,
  docsDownloaded: initialDocsDownloaded,
  doingInitialLoad: false,
  error: null,
  everLoggedIn: false,
  feedMessage: null,
  followingSyncRunning: false,
  forgotEmail: null,
  firstStartHorseID: null,
  fullSyncFail: false,
  goodConnection: true,
  gpsSignalLost: false,
  hoofTracksID: null,
  hoofTracksRunning: false,
  lastFullSync: null,
  locationStashingActive: false,
  locationRetry: false,
  needsRemotePersist: DB_SYNCED,
  newCareEvent: Map(),
  newCareHorseIDs: List(),
  photoQueue: Map(),
  ridePhotoStash: Map(),
  root: SIGNUP,
  showingRide: null,
  shutdownInProgress: false,
  signingOut: false,
  userID: null,
  userSearchResults: List(),
})

export default function LocalStateReducer(state=initialState, action) {
  switch (action.type) {
    case ADD_DOCS_DOWNLOADED:
      return state.setIn(['docsDownloaded', action.db], action.num)
    case ADD_DOCS_TO_DOWNLOAD:
      return state.set('docsToDownload', state.get('docsToDownload') + action.num)
    case ADD_NEW_CARE_HORSE_ID:
      const newIDs = state.get('newCareHorseIDs').push(action.horseID)
      return state.set('newCareHorseIDs', newIDs)
    case CHANGE_CARE_CALENDAR_TAB:
      return state.set('careCalendarTab', action.tabVal)
    case CLEAR_CURRENT_CARE_EVENT:
      return state.set('newCareHorseIDs', List()).set('newCareEvent', Map())
    case CLEAR_DOCS_NUMBERS:
      return state.set('docsToDownload', 0).set('docsDownloaded', initialDocsDownloaded)
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
      return initialState.set(
        'goodConnection',
        state.get('goodConnection')
      ).set(
        'everLoggedIn',
        state.get('everLoggedIn')
      )
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
    case GPS_SIGNAL_LOST:
      return state.set('gpsSignalLost', action.value)
    case LOAD_LOCAL_STATE:
      const loadedState = initialState.merge(action.localState)
      let newNeedsRemotePersist = loadedState.get('needsRemotePersist')
      if (newNeedsRemotePersist === DB_SYNCING) {
        newNeedsRemotePersist = DB_NEEDS_SYNC
      }
      return loadedState.set(
        'carrotMutex', false,
      ).set(
        'feedMessage', null
      ).set(
        'doingInitialLoad', false
      ).set(
        'signingOut', false
      ).set(
        'needsRemotePersist', newNeedsRemotePersist
      ).set(
        'hoofTracksID', null
      ).set(
        'backgroundGeolocationRunning', false
      )
    case NEW_APP_STATE:
      return state.set('appState', action.newState)
    case NEW_NETWORK_STATE:
      return state.set('goodConnection', action.goodConnection)
    case REMOVE_NEW_CARE_HORSE_ID:
      const i = state.get('newCareHorseIDs').indexOf(action.horseID)
      if (i >= 0) {
        const newIDs = state.get('newCareHorseIDs').remove(i)
        return state.set('newCareHorseIDs', newIDs)
      } else {
        return state
      }
    case REMOVE_STASHED_RIDE_PHOTO:
      return state.deleteIn(['ridePhotoStash', action.stashKey, action.photoID])
    case SAVE_USER_ID:
      return state.set('userID', action.userID).set('everLoggedIn', true).set('forgotEmail', null)
    case SET_ACTIVE_ATLAS_ENTRY:
      return state.set('activeAtlasEntry', action.id)
    case SET_ACTIVE_COMPONENT:
      return state.set('activeComponent', action.componentID)
    case SET_FEED_MESSAGE:
      return state.set('feedMessage', action.message)
    case SET_FIRST_START_HORSE_ID:
      return state.set('firstStartHorseID', Map({ horseID: action.horseID, horseUserID: action.horseUserID }))
    case SET_FORGOT_EMAIL:
      return state.set('forgotEmail', action.email)
    case SET_FULL_SYNC_FAIL:
      return state.set('fullSyncFail', action.status)
    case SET_HOOF_TRACKS_ID:
      return state.set('hoofTracksID', action.value)
    case SET_HOOF_TRACKS_RUNNING:
      return state.set('hoofTracksRunning', action.value)
    case SET_MAIN_CARE_EVENT_TYPE:
      const withMainType = state.get('newCareEvent').set('mainEventType', action.eventType)
      return state.set('newCareEvent', withMainType)
    case SET_REMOTE_PERSIST:
      return state.set('needsRemotePersist', action.value)
    case SET_SECONDARY_CARE_EVENT_TYPE:
      const withSecondaryType = state.get('newCareEvent').set('secondaryEventType', action.eventType)
      return state.set('newCareEvent', withSecondaryType)
    case SET_SHOWING_RIDE:
      return state.set('showingRide', action.rideID)
    case SET_SHUTDOWN_IN_PROGRESS:
      return state.set('shutdownInProgress', action.value)
    case SET_SIGNING_OUT:
      return state.set('signingOut', action.value)
    case SYNC_COMPLETE:
      return state.set(
        'lastFullSync', unixTimeNow()
      ).set(
        'awaitingFullSync', false
      )
    case SET_AWAITING_PW_CHANGE:
      return state.set('awaitingPWChange', action.newVal)
    case SET_BACKGROUND_GEOLOCATION_RUNNING:
      return state.set('backgroundGeolocationRunning', action.value)
    case SET_CARE_EVENT_DATE:
      const withDate = state.get('newCareEvent').set('date', action.date)
      return state.set('newCareEvent', withDate)
    case SET_CARE_EVENT_SPECIFIC_DATA:
      const withEventSpecificData = state.get('newCareEvent').set('eventSpecificData', action.data)
      return state.set('newCareEvent', withEventSpecificData)
    case SET_DOING_INITIAL_LOAD:
      return state.set('doingInitialLoad', action.newVal)
    case SET_FOLLOWING_SYNC_RUNNING:
      return state.set('followingSyncRunning', action.value)
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
        logInfo('Updating queue item that doesn\'t exist in queue anymore')
      }
      return updatedState
    case USER_SEARCH_RETURNED:
      return state.set('userSearchResults', action.userSearchResults)
    default:
      return state
  }
}
