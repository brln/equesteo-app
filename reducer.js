import {
  CHANGE_SCREEN, CLEAR_LAST_LOCATION,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  HORSE_CREATED,
  HORSE_SAVED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEEDS_PHOTO_UPLOAD,
  NEEDS_REMOTE_PERSIST,
  NEW_APP_STATE,
  NEW_LOCATION,
  NEW_NETWORK_STATE,
  ONGOING_NOTIFICATION_SHOWN,
  PHOTO_PERSIST_COMPLETE,
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
import { runMigrations } from './migrations/migrator'

const initialState = {
  localState: {
    appState: appStates.active,
    awaitingPWChange: false,
    clearStateAfterPersist: false,
    currentScreen: FEED,
    currentRide: null,
    error: null,
    goodConnection: false,
    justFinishedRide: false,
    jwt: null,
    lastFullSync: null,
    lastLocation: null,
    locallyPersisting: false,
    needsPhotoUploads: {
      profile: false,
      horse: false
    },
    needsRemotePersist: {
      horses: false,
      rides: false,
      users: false,
    },
    ongoingNotificationShown: false,
    root: 'login',
    userID: null,
    userLoaded: false,
    userSearchResults: [],
  },
  horses: [],
  rides: [],
  rideCarrots: [],
  rideComments: [],
  users: {},
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
    case NEEDS_PHOTO_UPLOAD:
      const needsPhotoUploads = {
        ...state.localState.needsPhotoUploads
      }
      needsPhotoUploads[action.photoType] = true
      return {
        ...state,
        localState: {
          ...state.localState,
          needsPhotoUploads
        }
      }
    case HORSE_CREATED:
      return {
        ...state,
        horses: [action.horse, ...state.horses]
      }
    case HORSE_SAVED:
      // @TODO: ugh, these need to be in a map by ID
      let j = 0
      let foundHorse = null
      for (j; j < state.horses.length; j++) {
        const horse = state.horses[j]
        if (horse._id === action.horse._id) {
          foundHorse = {...horse, ...action.horse}
          break
        }
      }
      const horsesClone = [...state.horses]
      horsesClone[j] = foundHorse
      return {
        ...state,
        horses: horsesClone
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
      const allUsers = {}
      for (let user of action.localData.users) {
        allUsers[user._id] = user
      }
      return {
        ...state,
        rides: action.localData.rides,
        rideCarrots: action.localData.rideCarrots,
        rideComments: action.localData.rideComments,
        horses: action.localData.horses,
        users: allUsers,
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
      if (state.localState.currentRide) {
        let newDistance = 0
        if (state.localState.lastLocation) {
          newDistance = haversine(
            state.localState.lastLocation.latitude,
            state.localState.lastLocation.longitude,
            action.location.latitude,
            action.location.longitude
          )
        }
        const rideCoordinates = [...state.localState.currentRide.rideCoordinates, action.location].sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        newState.localState.currentRide = {
          ...state.localState.currentRide,
          rideCoordinates,
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
    case PHOTO_PERSIST_COMPLETE:
      const newPhotoFalse = {...state.localState.needsPhotoUploads}
      for (let type of Object.keys(newPhotoFalse)) {
        newPhotoFalse[type] = false
      }
      return {
        ...state,
        localState: {
          ...state.localState,
          needsPhotoUploads: newPhotoFalse
        }
      }
    case RECEIVE_JWT:
      return {
        ...state,
        localState: {
          ...state.localState,
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
    case REMOVE_RIDE_FROM_STATE:
      let rideFound = null
      let l = 0
      for (l; l < state.rides.length; l++) {
        const ride = state.rides[l]
        if (ride._id === action.rideID) {
          rideFound = ride
          break
        }
      }
      if (rideFound) {
        const removeRidesClone = [...state.rides]
        removeRidesClone.splice(l, 1)
        return {
          ...state,
          rides: removeRidesClone
        }
      }
      return
    case RIDE_CARROT_CREATED:
      return {
        ...state,
        rideCarrots: [action.carrotData, ...state.rideCarrots]
      }
    case RIDE_CARROT_SAVED:
      // @TODO: ugh, these need to be in a map by ID, and this function needs to be de-duped
      let rideCarrotFound = null
      let k = 0
      for (k; k < state.rideCarrots.length; k++) {
        const currentRideCarrot = state.rideCarrots[k]
        if (currentRideCarrot._id === action.carrotData._id) {
          rideCarrotFound = {...currentRideCarrot, ...action.carrotData}
          break
        }
      }
      const rideCarrotClone = [...state.rideCarrots]
      rideCarrotClone[k] = rideCarrotFound
      return {
        ...state,
        rideCarrots: rideCarrotClone
      }
    case RIDE_COMMENT_CREATED:
      return {
        ...state,
        rideComments: [action.rideComment, ...state.rideComments]
      }
    case RIDE_CREATED:
      const newRide = { ...action.ride }
      return {
        ...state,
        rides: [newRide, ...state.rides],
        localState: {
          ...state.localState,
          justFinishedRide: true,
          currentRide: null,
        }
      }
    case RIDE_SAVED:
      // @TODO: ugh, these need to be in a map by ID
      let found = null
      let i = 0
      for (i; i < state.rides.length; i++) {
        const ride = state.rides[i]
        if (ride._id === action.ride._id) {
          found = {...ride, ...action.ride}
          break
        }
      }
      const ridesClone = [...state.rides]
      ridesClone[i] = found
      return {
        ...state,
        rides: ridesClone
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
    case SET_APP_ROOT:
      return {
        ...state,
        localState: {
          ...state.localState,
          root: action.root
        }
      }
    case START_RIDE:
      return {
        ...state,
        localState: {
          ...state.localState,
          currentRide: action.currentRide,
        }
      }
    case SYNC_COMPLETE:
      return {
        ...state,
        localState: {
          ...state.localState,
          lastFullSync: new Date()
        }
      }
    case TOGGLE_AWAITING_PW_CHANGE:
      return {
        ...state,
        localState: {
          ...state.localState,
          awaitingPWChange: !state.localState.awaitingPWChange
        }
      }
    case USER_UPDATED:
      const usersClone = {...state.users}
      usersClone[action.userData._id] = action.userData
      return {
        ...state,
        users: usersClone
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