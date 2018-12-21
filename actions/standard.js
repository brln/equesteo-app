import {
  AWAIT_FULL_SYNC,
  CLEAR_FEED_MESSAGE,
  CLEAR_LAST_LOCATION,
  CLEAR_PAUSED_LOCATIONS,
  CLEAR_SEARCH,
  CLEAR_SELECTED_RIDE_COORDINATES,
  CLEAR_STATE,
  CREATE_FOLLOW,
  CREATE_HORSE,
  CREATE_HORSE_PHOTO,
  CREATE_RIDE,
  CREATE_USER_PHOTO,
  DEQUEUE_PHOTO,
  DELETE_FOLLOW,
  DELETE_UNPERSISTED_HORSE,
  DELETE_UNPERSISTED_RIDE,
  DELETE_UNPERSISTED_PHOTO,
  DISCARD_CURRENT_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_UPDATED,
  HORSE_PHOTO_UPDATED,
  HORSE_USER_UPDATED,
  LOAD_CURRENT_RIDE_STATE,
  LOAD_LOCAL_STATE,
  LOCAL_DATA_LOADED,
  MERGE_STASHED_LOCATIONS,
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  PAUSE_LOCATION_TRACKING,
  POP_SHOW_RIDE_SHOWN,
  RECEIVE_JWT,
  REMOVE_STASHED_RIDE_PHOTO,
  REPLACE_LAST_LOCATION,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COMMENT_UPDATED,
  RIDE_COORDINATES_LOADED,
  RIDE_ELEVATIONS_UPDATED,
  RIDE_HORSE_UPDATED,
  RIDE_PHOTO_UPDATED,
  RIDE_UPDATED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_API_CLIENT,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
  SET_FULL_SYNC_FAIL,
  SET_POP_SHOW_RIDE,
  SET_REMOTE_PERSIST_DB,
  SHOW_POP_SHOW_RIDE,
  SET_SIGNING_OUT,
  START_RIDE,
  STASH_NEW_LOCATIONS,
  STASH_RIDE_PHOTO,
  STOP_STASH_NEW_LOCATIONS,
  SYNC_COMPLETE,
  SET_AWAITING_PW_CHANGE,
  SET_DOING_INITIAL_LOAD,
  SET_SHOWING_RIDE,
  UNPAUSE_LOCATION_TRACKING,
  UPDATE_NEW_RIDE_COORDS,
  UPDATE_PHOTO_STATUS,
  USER_PHOTO_UPDATED,
  USER_SEARCH_RETURNED,
  USER_UPDATED,
} from '../constants'

export function awaitFullSync () {
  return {
    type: AWAIT_FULL_SYNC
  }
}

export function clearFeedMessage () {
  return {
    type: CLEAR_FEED_MESSAGE
  }
}

export function clearLastLocation () {
  return {
    type: CLEAR_LAST_LOCATION,
  }
}

export function clearPausedLocations () {
  return {
    type: CLEAR_PAUSED_LOCATIONS
  }
}

export function clearSearch () {
  return {
    type: CLEAR_SEARCH
  }
}

export function clearSelectedRideCoordinates () {
  return {
    type: CLEAR_SELECTED_RIDE_COORDINATES
  }
}

export function clearState () {
  return {
    type: CLEAR_STATE,
  }
}

export function createFollow (followID, followingID, followerID) {
  return {
    type: CREATE_FOLLOW,
    followID,
    followingID,
    followerID
  }
}

export function createHorse (horseID, horseUserID, userID) {
  return {
    type: CREATE_HORSE,
    horseID,
    horseUserID,
    userID
  }
}

export function createHorsePhoto (horseID, userID, photoData) {
  return {
    type: CREATE_HORSE_PHOTO,
    horseID,
    userID,
    photoData,
  }
}

export function createRide (
  rideID,
  userID,
  currentRide,
  currentRideElevations,
  currentRideCoordinates,
  currentRidePhotos,
) {
  return {
    type: CREATE_RIDE,
    currentRide,
    currentRideCoordinates,
    currentRideElevations,
    currentRidePhotos,
    rideID,
    userID
  }
}

export function createUserPhoto (userID, photoData) {
  return {
    type: CREATE_USER_PHOTO,
    userID,
    photoData
  }
}

export function deleteFollow (followID) {
  return {
    type: DELETE_FOLLOW,
    followID
  }
}

export function deleteUnpersistedHorse (horseID, horseUserID) {
  return {
    type: DELETE_UNPERSISTED_HORSE,
    horseID,
    horseUserID,
  }
}

export function deleteUnpersistedRide (rideID) {
  return {
    type: DELETE_UNPERSISTED_RIDE,
    rideID
  }
}

export function deleteUnpersistedPhoto (photoSection, photoID) {
  return {
    type: DELETE_UNPERSISTED_PHOTO,
    photoSection,
    photoID
  }
}

export function dequeuePhoto (photoID) {
  return {
    type: DEQUEUE_PHOTO,
    photoID
  }
}

export function discardCurrentRide ()  {
  return {
    type: DISCARD_CURRENT_RIDE
  }
}

export function dismissError () {
  return {
    type: DISMISS_ERROR
  }
}

export function enqueuePhoto (queueItem) {
  return {
    type: ENQUEUE_PHOTO,
    queueItem
  }
}

export function errorOccurred (message) {
  return {
    type: ERROR_OCCURRED,
    message
  }
}

export function horsePhotoUpdated (horsePhoto) {
  return {
    type: HORSE_PHOTO_UPDATED,
    horsePhoto
  }
}

export function horseUpdated (horse) {
  return {
    type: HORSE_UPDATED,
    horse
  }
}


export function followUpdated (follow) {
  return {
    type: FOLLOW_UPDATED,
    follow
  }
}

export function horseUserUpdated (horseUser) {
  return {
    type: HORSE_USER_UPDATED,
    horseUser
  }
}

export function loadCurrentRideState (currentRideState) {
  return {
    type: LOAD_CURRENT_RIDE_STATE,
    currentRideState
  }
}

export function loadLocalState (localState) {
  return {
    type: LOAD_LOCAL_STATE,
    localState
  }
}

export function localDataLoaded (localData) {
  return {
    type: LOCAL_DATA_LOADED,
    localData
  }
}

export function mergeStashedLocations () {
  return {
    type: MERGE_STASHED_LOCATIONS,
  }
}

export function newAppState (newState) {
  return {
    logData: ['newState'],
    type: NEW_APP_STATE,
    newState,
  }
}

export function newLocation (location, elevation) {
  return {
    type: NEW_LOCATION,
    location,
    elevation,
  }
}

export function newNetworkState (goodConnection) {
  return {
    type: NEW_NETWORK_STATE,
    goodConnection,
    logData: ['connectionType', 'effectiveConnectionType'],
  }
}

export function pauseLocationTracking () {
  return {
    type: PAUSE_LOCATION_TRACKING
  }
}

export function popShowRideShown () {
  return {
    type: POP_SHOW_RIDE_SHOWN
  }
}

export function removeStashedRidePhoto (photoID, stashKey) {
  return {
    type: REMOVE_STASHED_RIDE_PHOTO,
    photoID,
    stashKey
  }
}

export function replaceLastLocation (newLocation, newElevation) {
  return {
    type: REPLACE_LAST_LOCATION,
    newLocation,
    newElevation,
  }
}

export function rideCoordinatesLoaded (rideCoordinates) {
  return {
    type: RIDE_COORDINATES_LOADED,
    rideCoordinates
  }
}

export function rideCarrotCreated (carrotData) {
  return {
    type: RIDE_CARROT_CREATED,
    carrotData
  }
}

export function rideCarrotSaved (carrotData) {
  return {
    type: RIDE_CARROT_SAVED,
    carrotData
  }
}

export function rideCommentUpdated (rideComment) {
  return {
    type: RIDE_COMMENT_UPDATED,
    rideComment
  }
}

export function rideHorseUpdated (rideHorse) {
  return {
    type: RIDE_HORSE_UPDATED,
    rideHorse
  }
}

export function rideUpdated (ride) {
  return {
    type: RIDE_UPDATED,
    ride
  }
}

export function rideElevationsUpdated (rideElevations) {
  return {
    type: RIDE_ELEVATIONS_UPDATED,
    rideElevations
  }
}

export function ridePhotoUpdated (ridePhoto) {
  return {
    type: RIDE_PHOTO_UPDATED,
    ridePhoto
  }
}

export function setPopShowRide (rideID, showRideNow, scrollToComments) {
  return {
    type: SET_POP_SHOW_RIDE,
    rideID,
    showRideNow,
    scrollToComments,
  }
}

export function setRemotePersistDB (database, value) {
  return {
    type: SET_REMOTE_PERSIST_DB,
    database,
    value,
    logData: ['database', 'value']
  }
}

export function setFeedMessage (message) {
  return {
    type: SET_FEED_MESSAGE,
    message
  }
}

export function setFullSyncFail (status) {
  return {
    type: SET_FULL_SYNC_FAIL,
    status,
    logData: ['status']
  }
}

export function setShowingRide (rideID) {
  return {
    type: SET_SHOWING_RIDE,
    rideID,
  }
}

export function showPopShowRide () {
  return {
    type: SHOW_POP_SHOW_RIDE,
  }
}

export function stashNewLocations () {
  return {
    type: STASH_NEW_LOCATIONS
  }
}

export function stashRidePhoto (photoData, stashKey) {
  return {
    type: STASH_RIDE_PHOTO,
    photoData,
    stashKey
  }
}

export function stopStashNewLocations () {
  return {
    type: STOP_STASH_NEW_LOCATIONS
  }
}

export function saveUserID(userID) {
  return {
    type: SAVE_USER_ID,
    userID
  }
}

export function setActiveComponent (componentID) {
  return {
    logData: ['componentID'],
    type: SET_ACTIVE_COMPONENT,
    componentID
  }
}

export function setFirstStartHorseID (horseID, horseUserID) {
  return {
    type: SET_FIRST_START_HORSE_ID,
    horseID,
    horseUserID
  }
}

export function startRide(firstCoord, firstElevation, startTime) {
  return {
    type: START_RIDE,
    firstCoord,
    firstElevation,
    startTime
  }
}

export function syncComplete () {
  return {
    type: SYNC_COMPLETE,
  }
}

export function setAwaitingPasswordChange (newVal) {
  return {
    type: SET_AWAITING_PW_CHANGE,
    newVal
  }
}

export function setDoingInitialLoad (newVal) {
  return {
    type: SET_DOING_INITIAL_LOAD,
    newVal
  }
}

export function setSigningOut (value) {
  return {
    type: SET_SIGNING_OUT,
    value
  }
}

export function unpauseLocationTracking () {
  return {
    type: UNPAUSE_LOCATION_TRACKING
  }
}

export function updatePhotoStatus (photoID, newStatus) {
  return {
    type: UPDATE_PHOTO_STATUS,
    photoID,
    newStatus,
    logData: ['photoID', 'newStatus']
  }
}

export function updateNewRideCoords (newCoords) {
  return {
    type: UPDATE_NEW_RIDE_COORDS,
    newCoords
  }
}

export function userPhotoUpdated (userPhoto) {
  return {
    type: USER_PHOTO_UPDATED,
    userPhoto
  }
}

export function userSearchReturned (userSearchResults) {
  return {
    type: USER_SEARCH_RETURNED,
    userSearchResults,
  }
}

export function userUpdated (userData) {
  return {
    type: USER_UPDATED,
    userData,
  }
}

