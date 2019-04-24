import {
  ADD_DOCS_DOWNLOADED,
  ADD_DOCS_TO_DOWNLOAD,
  ADD_NEW_CARE_HORSE_ID,
  CARE_EVENT_UPDATED,
  CARROT_MUTEX,
  CLEAR_CURRENT_CARE_EVENT,
  CLEAR_DOCS_NUMBERS,
  CLEAR_FEED_MESSAGE,
  CLEAR_LAST_LOCATION,
  CLEAR_PAUSED_LOCATIONS,
  CLEAR_RIDE_PHOTO_FROM_STASH,
  CLEAR_RIDE_PHOTO_STASH,
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
  HORSE_CARE_EVENT_UPDATED,
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
  NOTIFICATION_UPDATED,
  PAUSE_LOCATION_TRACKING,
  REMOVE_NEW_CARE_HORSE_ID,
  REMOVE_STASHED_RIDE_PHOTO,
  REPLACE_LAST_LOCATION,
  RIDE_ATLAS_ENTRY_UPDATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COMMENT_UPDATED,
  RIDE_COORDINATES_LOADED,
  RIDE_ELEVATIONS_LOADED,
  RIDE_HORSE_UPDATED,
  RIDE_PHOTO_UPDATED,
  RIDE_UPDATED,
  SAVE_USER_ID,
  SET_ACTIVE_ATLAS_ENTRY,
  SET_ACTIVE_COMPONENT,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
  SET_FOLLOWING_SYNC_RUNNING,
  SET_FULL_SYNC_FAIL,
  SET_LOCATION_RETRY,
  SET_REMOTE_PERSIST,
  SET_SHOWING_RIDE,
  SET_SIGNING_OUT,
  START_RIDE,
  STASH_NEW_LOCATIONS,
  STASH_RIDE_PHOTO,
  STOP_STASH_NEW_LOCATIONS,
  SYNC_COMPLETE,
  SET_AWAITING_PW_CHANGE,
  SET_DOING_INITIAL_LOAD,
  UNPAUSE_LOCATION_TRACKING,
  UPDATE_PHOTO_STATUS,
  USER_PHOTO_UPDATED,
  USER_SEARCH_RETURNED,
  USER_UPDATED,
  SET_CARE_EVENT_DATE,
  SET_MAIN_CARE_EVENT_TYPE,
  SET_SECONDARY_CARE_EVENT_TYPE,
  SET_CARE_EVENT_SPECIFIC_DATA,
} from '../constants'

export function addDocsDownloaded (num, db) {
  return {
    type: ADD_DOCS_DOWNLOADED,
    num,
    db
  }
}

export function addDocsToDownload (num) {
  return {
    type: ADD_DOCS_TO_DOWNLOAD,
    num
  }
}

export function clearDocsNumbers () {
  return {
    type: CLEAR_DOCS_NUMBERS,
  }
}

export function addNewCareHorseID (horseID) {
  return {
    type: ADD_NEW_CARE_HORSE_ID,
    horseID
  }
}

export function careEventUpdated (careEvent) {
  return {
    type: CARE_EVENT_UPDATED,
    careEvent
  }
}

export function carrotMutex (value) {
  return {
    type: CARROT_MUTEX,
    value,
  }
}

export function clearCurrentCareEvent () {
  return {
    type: CLEAR_CURRENT_CARE_EVENT
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

export function clearRidePhotoFromStash (stashKey, photoID) {
  return {
    type: CLEAR_RIDE_PHOTO_FROM_STASH,
    stashKey,
    photoID
  }
}

export function clearRidePhotoStash (stashKey) {
  return {
    type: CLEAR_RIDE_PHOTO_STASH,
    stashKey
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
    followerID,
    mixpanel: true
  }
}

export function createHorse (horseID, horseUserID, userID) {
  return {
    type: CREATE_HORSE,
    horseID,
    horseUserID,
    userID,
    mixpanel: true
  }
}

export function createHorsePhoto (horseID, userID, photoData) {
  return {
    type: CREATE_HORSE_PHOTO,
    horseID,
    userID,
    photoData,
    mixpanel: true
  }
}

export function createRide (
  rideID,
  userID,
  currentRide,
  currentRideElevations,
  currentRideCoordinates,
  duplicateFrom,
) {
  return {
    type: CREATE_RIDE,
    currentRide,
    currentRideCoordinates,
    currentRideElevations,
    duplicateFrom,
    rideID,
    userID,
    mixpanel: true
  }
}

export function rideAtlasEntryUpdated (rideAtlasEntry) {
  return {
    type: RIDE_ATLAS_ENTRY_UPDATED,
    rideAtlasEntry
  }
}

export function createUserPhoto (userID, photoData) {
  return {
    type: CREATE_USER_PHOTO,
    userID,
    photoData,
    mixpanel: true
  }
}

export function deleteFollow (followID) {
  return {
    type: DELETE_FOLLOW,
    followID,
    mixpanel: true
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
    type: DISCARD_CURRENT_RIDE,
    mixpanel: true
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
    message,
    logData: ['message'],
    mixpanel: true
  }
}

export function horseCareEventUpdated (horseCareEvent) {
  return {
    type: HORSE_CARE_EVENT_UPDATED,
    horseCareEvent,
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
    horse,
  }
}


export function followUpdated (follow) {
  return {
    type: FOLLOW_UPDATED,
    follow,
  }
}

export function horseUserUpdated (horseUser) {
  return {
    type: HORSE_USER_UPDATED,
    horseUser,
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
  }
}

export function notificationUpdated (notification) {
  return {
    type: NOTIFICATION_UPDATED,
    notification,
  }
}

export function pauseLocationTracking () {
  return {
    type: PAUSE_LOCATION_TRACKING
  }
}

export function removeNewCareHorseID (horseID) {
  return {
    type: REMOVE_NEW_CARE_HORSE_ID,
    horseID
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
    carrotData,
    mixpanel: true
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
    rideComment,
  }
}

export function rideElevationsLoaded (rideElevations) {
  return {
    type: RIDE_ELEVATIONS_LOADED,
    rideElevations
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
    ride,
    mixpanel: true
  }
}

export function ridePhotoUpdated (ridePhoto) {
  return {
    type: RIDE_PHOTO_UPDATED,
    ridePhoto
  }
}

export function setActiveAtlasEntry (id) {
  return {
    type: SET_ACTIVE_ATLAS_ENTRY,
    id
  }
}

export function setFollowingSyncRunning (value) {
  return {
    type: SET_FOLLOWING_SYNC_RUNNING,
    value
  }
}

export function setRemotePersist (value) {
  return {
    type: SET_REMOTE_PERSIST,
    value,
    logData: ['value']
  }
}

export function setShowingRide (rideID) {
  return {
    type: SET_SHOWING_RIDE,
    rideID,
  }
}

export function setFeedMessage (message) {
  return {
    type: SET_FEED_MESSAGE,
    message,
    logData: ['message']
  }
}

export function setFullSyncFail (status) {
  return {
    type: SET_FULL_SYNC_FAIL,
    status,
    logData: ['status'],
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

export function setCareEventDate (date) {
  return {
    type: SET_CARE_EVENT_DATE,
    date
  }
}

export function setMainCareEventType (eventType) {
  return {
    type: SET_MAIN_CARE_EVENT_TYPE,
    eventType,
    logData: ['eventType']
  }
}

export function setSecondaryCareEventType (eventType) {
  return {
    type: SET_SECONDARY_CARE_EVENT_TYPE,
    eventType,
    logData: ['eventType']
  }
}

export function setCareEventSpecificData (data) {
  return {
    type: SET_CARE_EVENT_SPECIFIC_DATA,
    data
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
    startTime,
    mixpanel: true
  }
}

export function syncComplete () {
  return {
    type: SYNC_COMPLETE,
    mixpanel: true
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

export function setLocationRetry (newVal) {
  return {
    type: SET_LOCATION_RETRY,
    newVal
  }
}

export function setSigningOut (value) {
  return {
    type: SET_SIGNING_OUT,
    value,
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
    mixpanel: true
  }
}

