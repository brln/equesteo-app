import {
  CHANGE_SCREEN, CLEAR_LAST_LOCATION,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  HORSE_SAVED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEEDS_REMOTE_PERSIST,
  NEW_APP_STATE,
  NEW_LOCATION,
  NEW_NETWORK_STATE,
  ONGOING_NOTIFICATION_SHOWN,
  PUSHER_LISTENING,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  RIDE_SAVED,
  SAVE_USER_ID,
  START_RIDE,
  USER_SEARCH_RETURNED,
  USER_SAVED,
} from './constants'
import {
  appStates,
  goodConnection,
  haversine
} from './helpers'
import { FEED } from './screens'
import { runMigrations } from './migrations/migrator'

const initialState = {
  localState: {
    app: 'login',
    appState: appStates.active,
    clearStateAfterPersist: false,
    currentScreen: FEED,
    currentRide: null,
    error: null,
    goodConnection: false,
    justFinishedRide: false,
    jwt: null,
    lastLocation: null,
    locallyPersisting: false,
    needsRemotePersist: {
      horses: false,
      rides: false,
      users: false,
    },
    ongoingNotificationShown: false,
    pusherSocket: null,
    userID: null,
    userLoaded: false,
    userSearchResults: [],
  },
  horses: [],
  rides: [],
  users: [],
  version: 1
}

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CHANGE_SCREEN:
      return {
        ...state,
        localState: {
          ...state.localState,
          currentScreen: action.screen,
        }
      }
    case CLEAR_LAST_LOCATION:
      return {
        ...state,
        localState: {
          ...state.localState,
          lastLocation: null,
        }
      }
    case CLEAR_SEARCH:
      return {
        ...state,
        localState: {
          ...state.localState,
          userSearchResults: []
        }
      }
    case CLEAR_STATE:
      return {
        ...initialState,
        localState: {
          ...initialState.localState,
          goodConnection: state.localState.goodConnection,
        }
      }
    case CLEAR_STATE_AFTER_PERSIST:
      return {
        ...state,
        localState: {
          ...state.localState,
          clearStateAfterPersist: true
        }
      }
    case DISCARD_RIDE:
      return {
        ...state,
        localState: {
          ...state.localState,
          currentRide: null
        }
      }
    case DISMISS_ERROR:
      return {
        ...state,
        localState: {
          ...state.localState,
          error: null
        }
      }
    case ERROR_OCCURRED:
      return {
        ...state,
        localState: {
          ...state.localState,
          error: action.message
        }
      }
    case HORSE_SAVED:
      return {
        ...state,
        horses: [action.horse, ...state.horses]
      }
    case JUST_FINISHED_RIDE_SHOWN:
      return {
        ...state,
        localState: {
          ...state.localState,
          justFinishedRide: false
        }
      }
    case LOCAL_DATA_LOADED:
      return {
        ...state,
        rides: action.localData.rides,
        horses: action.localData.horses,
        users: action.localData.users,
        localState: {
          ...state.localState,
          currentScreen: FEED,
          clearStateAfterPersist: false,
          userID: action.localData.userID
        }
      }
    case NEEDS_REMOTE_PERSIST:
      let newNeeds = {...state.localState.needsRemotePersist}
      newNeeds[action.database] = true
      return {
        ...state,
        localState: {
          ...state.localState,
          needsRemotePersist: newNeeds
        }
      }
    case NEW_APP_STATE:
      return {
        ...state,
        localState: {
          ...state.localState,
          appState: action.newState
        }
      }
    case NEW_LOCATION:
      const newState = {
        ...state,
        localState: {
          ...state.localState,
          lastLocation: action.location
        }
      }
      if (state.localState.currentRide && state.localState.lastLocation) {
        const newDistance = haversine(
          state.localState.lastLocation.latitude,
          state.localState.lastLocation.longitude,
          action.location.latitude,
          action.location.longitude
        )
        newState.localState.currentRide = {
          ...state.localState.currentRide,
          rideCoordinates: [...state.localState.currentRide.rideCoordinates, action.location],
          distance: state.localState.currentRide.distance + newDistance,
        }
      }
      return newState
    case NEW_NETWORK_STATE:
      return {
        ...state,
        localState: {
          ...state.localState,
          goodConnection: goodConnection(
            action.connectionType,
            action.effectiveConnectionType
          )
        }
      }
    case ONGOING_NOTIFICATION_SHOWN:
      return {
        ...state,
        localState: {
          ...state.localState,
          ongoingNotificationShown: action.isShowing
        }
      }
    case PUSHER_LISTENING:
      debugger
      return {
        ...state,
        localState: {
          ...state.localState,
          pusherSocket: action.socketInstance
        }
      }
    case RECEIVE_JWT:
      return {
        ...state,
        localState: {
          ...state.localState,
          app: 'after-login',
          jwt: action.token
        }
      }
    case REMOTE_PERSIST_COMPLETE:
      let newNeedsFalse = {...state.localState.needsRemotePersist}
      newNeedsFalse[action.database] = false
      return {
        ...state,
        localState: {
          ...state.localState,
          needsRemotePersist: newNeedsFalse
        }
      }
    case RIDE_SAVED:
      const newRide = {
        ...state.localState.currentRide,
        ...action.ride,
        userID: state.localState.userID
      }
      return {
        ...state,
        rides: [newRide, ...state.rides],
        localState: {
          ...state.localState,
          justFinishedRide: true,
          currentRide: null,
        }
      }
    case SAVE_USER_ID:
      return {
        ...state,
        localState: {
          ...state.localState,
          userLoaded: true,
          userID: action.userID
        },
      }
    case START_RIDE:
      return {
        ...state,
        localState: {
          ...state.localState,
          currentRide: action.currentRide
        }
      }
    case USER_SAVED:
      return {
        ...state,
        users: [action.userData, ...state.users]
      }
    case USER_SEARCH_RETURNED:
      return {
        ...state,
        localState: {
          ...state.localState,
          userSearchResults: action.userSearchResults
        }
      }
    default:
      return state
  }
}