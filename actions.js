import { AppState, NetInfo } from 'react-native'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation-brln'
import { ENV } from 'react-native-dotenv'

import { unixTimeNow, generateUUID, staticMap } from "./helpers"
import { FEED } from './screens'
import { LocalStorage, PouchCouch, UserAPI } from './services'
import {BadRequestError, NotConnectedError, UnauthorizedError} from "./errors"
import { enqueueHorsePhoto, enqueueProfilePhoto, enqueueRidePhoto } from './photoQueue'

import {
  CHANGE_SCREEN,
  CLEAR_LAST_LOCATION,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_CREATED,
  HORSE_SAVED,
  JUST_FINISHED_RIDE_SHOWN,
  LOCAL_DATA_LOADED,
  NEEDS_PHOTO_UPLOAD,
  NEEDS_REMOTE_PERSIST,
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  PHOTO_PERSIST_COMPLETE,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COMMENT_CREATED,
  RIDE_CREATED,
  RIDE_SAVED,
  SAVE_USER_ID,
  SET_APP_ROOT,
  START_RIDE,
  SYNC_COMPLETE,
  TOGGLE_AWAITING_PW_CHANGE,
  TOGGLE_DOING_INITIAL_LOAD,
  USER_UPDATED,
  USER_SEARCH_RETURNED,
} from './constants'

export function changeScreen(screen) {
  return {
    type: CHANGE_SCREEN,
    logData: ['screen'],
    screen,
  }
}

export function clearLastLocation () {
  return {
    type: CLEAR_LAST_LOCATION,
  }
}

export function clearSearch () {
  return {
    type: CLEAR_SEARCH
  }
}

export function clearState () {
  return {
    type: CLEAR_STATE,
  }
}

function clearStateAfterPersist () {
  return {
    type: CLEAR_STATE_AFTER_PERSIST,
  }
}

export function discardRide ()  {
  return {
    type: DISCARD_RIDE
  }
}

export function dismissError () {
  return {
    type: DISMISS_ERROR
  }
}

export function horseSaved (horse) {
  return {
    type: HORSE_SAVED,
    horse
  }
}

export function needsPhotoUpload (photoType) {
  return {
    type: NEEDS_PHOTO_UPLOAD,
    photoType
  }
}

export function errorOccurred (message) {
  return {
    type: ERROR_OCCURRED,
    message
  }
}

export function followUpdated (follow) {
  return {
    type: FOLLOW_UPDATED,
    follow
  }
}

function horseCreated (horse) {
  return {
    type: HORSE_CREATED,
    horse,
  }
}

export function justFinishedRideShown () {
  return {
    type: JUST_FINISHED_RIDE_SHOWN
  }
}

export function localDataLoaded (localData) {
  return {
    type: LOCAL_DATA_LOADED,
    localData
  }
}

export function needsRemotePersist (database) {
  return {
    type: NEEDS_REMOTE_PERSIST,
    database
  }
}

function newAppState (newState) {
  return {
    logData: ['newState'],
    type: NEW_APP_STATE,
    newState,
  }
}

function newLocation (location) {
  return {
    type: NEW_LOCATION,
    location
  }
}

function newNetworkState (connectionType, effectiveConnectionType) {
  return {
    type: NEW_NETWORK_STATE,
    connectionType,
    effectiveConnectionType,
  }
}

function receiveJWT (token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

export function saveUserID(userID) {
  return {
    type: SAVE_USER_ID,
    userID
  }
}

export function photoPersistComplete () {
  return {
    type: PHOTO_PERSIST_COMPLETE
  }
}

export function remotePersistComplete (database) {
  return {
    type: REMOTE_PERSIST_COMPLETE,
    database
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

function rideCommentCreated (rideComment) {
  return {
    type: RIDE_COMMENT_CREATED,
    rideComment
  }
}

function rideCreated (ride) {
  return {
    type: RIDE_CREATED,
    ride,
  }
}

function rideSaved (ride) {
  return {
    type: RIDE_SAVED,
    ride
  }
}

function setAppRoot (root) {
  return {
    type: SET_APP_ROOT,
    root
  }
}

export function startRide(firstCoord) {
  const coords = []
  if (firstCoord) {
    coords.push(firstCoord)
  }
  return {
    type: START_RIDE,
    currentRide: {
      rideCoordinates: coords,
      distance: 0,
      startTime: unixTimeNow()
    },
  }
}

export function syncComplete () {
  return {
    type: SYNC_COMPLETE,
  }
}

function toggleAwaitingPasswordChange () {
  return {
    type: TOGGLE_AWAITING_PW_CHANGE
  }
}

function toggleDoingInitialLoad () {
  return {
    type: TOGGLE_DOING_INITIAL_LOAD
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

//  =========================================
// |<  FUNCTIONAL ACTIONS                |||>>
//  =========================================

export function appInitialized () {
  return async (dispatch) => {
    dispatch(findLocalToken())
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
  }
}

export function changeHorsePhotoData(horseID, photoID, uri) {
  return async (dispatch, getState) => {
    let horseData = null
    for (let horse of getState().horses) {
      if (horse._id === horseID) {
        horseData = {...horse}
        break;
      }
    }

    let timestamp = unixTimeNow()
    if (horseData.photosByID[photoID]) {
      timestamp = horseData.photosByID[photoID].timestamp
    } else {
      horseData.profilePhotoID = photoID
    }

    const photosClone = {...horseData.photosByID}
    photosClone[photoID] = {
      timestamp,
      uri
    }
    horseData.photosByID = photosClone
    dispatch(saveHorse(horseData))
  }
}

export function getPWCode (email) {
  return async () => {
    let userAPI = new UserAPI()
    await userAPI.getPWCode(email)
  }
}

export function exchangePWCode (email, code) {
  return async (dispatch) => {
    let userAPI = new UserAPI()
    try {
      const resp = await userAPI.exchangePWCodeForToken(email, code)
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const pouchCouch = new PouchCouch(token)
      dispatch(toggleAwaitingPasswordChange())
      await pouchCouch.localReplicateDB('all', [...following, userID])
      dispatch(receiveJWT(resp.token))
      dispatch(saveUserID(resp.id))
      dispatch(loadLocalData())
      await LocalStorage.saveToken(resp.token, resp.id);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function changeRidePhotoData(rideID, photoID, uri) {
  return async (dispatch, getState) => {
    let rideData = null
    for (let ride of getState().rides) {
      if (ride._id === rideID) {
        rideData = {...ride}
        break
      }
    }
    const photosClone = {...rideData.photosByID}
    photosClone[photoID] = {
      ...photosClone[photoID],
      uri,
    }
    rideData.photosByID = photosClone
    dispatch(saveRide(rideData))
  }
}

export function changeUserPhotoData (photoID, uri) {
  return async (dispatch, getState) => {
    const userID = getState().localState.userID
    const userDoc = getState().users[userID]
    const userClone = {...userDoc}

    let timestamp = unixTimeNow()
    if (userClone.photosByID[photoID]) {
      timestamp = userClone.photosByID[photoID].timestamp
    } else {
      userClone.profilePhotoID = photoID
    }

    const photosClone = {...userDoc.photosByID}
    photosClone[photoID] = {
      timestamp,
      uri,
    }
    userClone.photosByID = photosClone
    dispatch(updateUser(userClone))
  }
}

export function createHorse (horseData) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const newHorse = {
      _id: horseData._id,
      birthDay: null,
      birthMonth: null,
      birthYear: null,
      description: null,
      heightHands: null,
      heightInches: null,
      name: horseData.name,
      profilePhotoID: null,
      photosByID: {},
      userID: horseData.userID
    }
    const doc = await pouchCouch.saveHorse(newHorse)
    dispatch(horseCreated({...newHorse, _rev: doc.rev}))
    dispatch(needsRemotePersist('horses'))
  }
}

export function createRide (rideData) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch()
    const currentRide = getState().localState.currentRide
    const theRide = {
      ...getState().localState.currentRide,
      rideCoordinates: currentRide.rideCoordinates,
      distance: currentRide.distance,
      startTime: currentRide.startTime,
      _id: rideData._id,
      elapsedTimeSecs: rideData.elapsedTimeSecs,
      name: rideData.name,
      horseID: rideData.horseID,
      userID: rideData.userID,
      photosByID: rideData.photosByID,
      coverPhotoID: rideData.coverPhotoID,
      type: 'ride',
    }
    theRide.mapURL = staticMap(theRide)
    const doc = await pouchCouch.saveRide(theRide)
    dispatch(rideCreated({...theRide, _id: doc.id, _rev: doc.rev}))
    dispatch(needsRemotePersist('rides'))
  }
}

export function createRideComment(commentData) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const currentUserID = getState().localState.userID
    const commentID = `${currentUserID}_${(new Date).getTime().toString()}`
    const newComment = {
      _id: commentID,
      rideID: commentData.rideID,
      userID: currentUserID,
      deleted: false,
      type: 'comment',
      comment: commentData.comment,
      timestamp: commentData.timestamp
    }
    const doc = await pouchCouch.saveRide(newComment)
    dispatch(rideCommentCreated({...newComment, _rev: doc.rev}))
    dispatch(needsRemotePersist('rides'))
  }
}

export function createFollow (followingID) {
  return async (dispatch, getState) => {
    const userID = getState().localState.userID
    const followRecordID = `${userID}_${followingID}`

    let followingDoc = {
      _id: followRecordID,
      followingID,
      followerID: userID,
      deleted: false,
      type: "follow"
    }
    for (let followID of Object.keys(getState().follows)) {
      const followRecord = getState().follows[followID]
      if (followID === followRecordID) {
        followingDoc = {...followRecord, deleted: false}
      }
    }

    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveUser(followingDoc)
    await dispatch(followUpdated({...followingDoc, _rev: doc.rev}))
    dispatch(needsRemotePersist('users'))
    dispatch(syncDBPull('all'))
  }
}

export function deleteFollow (followingID) {
  return async (dispatch, getState) => {
    const userID = getState().localState.userID
    const followRecordID = `${userID}_${followingID}`
    let followingDoc
    for (let followID of Object.keys(getState().follows)) {
      const followRecord = getState().follows[followID]
      if (followID === followRecordID) {
        followingDoc = {...followRecord, deleted: true}
      }
    }
    if (!followingDoc) {
      throw Error('should have found a following doc')
    }

    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveUser(followingDoc)
    dispatch(followUpdated({...followingDoc, _rev: doc.rev}))
    dispatch(needsRemotePersist('users'))
  }
}

function findLocalToken () {
  return async (dispatch) => {
    const storedToken = await LocalStorage.loadToken()
    if (storedToken !== null) {
      dispatch(receiveJWT(storedToken.token))
      dispatch(saveUserID(storedToken.userID))
      dispatch(setAppRoot('after-login'))
      await dispatch(loadLocalData())
      dispatch(syncDBPull('all'))
    }
  }
}

function loadLocalData () {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const localData = await pouchCouch.localLoad()
    dispatch(localDataLoaded(localData))
  }
}

export function newPassword (password) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().localState.jwt)
    try {
      await userAPI.changePassword(password)
      dispatch((setAppRoot('after-login')))
    } catch (e) {
      console.log(e)
    }
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().localState.jwt)
    try {
      const resp = await userAPI.findUser(phrase)
      dispatch(userSearchReturned(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function saveRide (rideData) {
  return async (dispatch) => {
    const pouchCouch = new PouchCouch()
    const doc = await pouchCouch.saveRide(rideData)
    dispatch(rideSaved({...rideData, _rev: doc.rev}))
    dispatch(needsRemotePersist('rides'))
  }
}

export function saveHorse (horseData) {
  return async (dispatch) => {
    const pouchCouch = new PouchCouch()
    const doc = await pouchCouch.saveHorse(horseData)
    dispatch(horseSaved({...horseData, _rev: doc.rev}))
    dispatch(needsRemotePersist('horses'))
  }
}

export function signOut () {
  return async(dispatch) => {
    await LocalStorage.deleteToken()
    const pouchCouch = new PouchCouch()
    await pouchCouch.deleteLocalDBs()
    dispatch(stopLocationTracking())
    dispatch(clearStateAfterPersist())
  }
}

export function startLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 10,
      distanceFilter: 10,
      maxLocations: 10,
      notificationTitle: 'You\'re out on a ride.',
      notificationText: 'Tap here to see your progress.',
      // debug: true,
      locationProvider: BackgroundGeolocation.RAW_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
    });

    BackgroundGeolocation.on('location', (location) => {
      const parsedLocation = {
        accuracy: location.accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.time,
      }
      dispatch(newLocation(parsedLocation))
    })

    BackgroundGeolocation.start()
  }
}

function startNetworkTracking () {
  return async (dispatch) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      dispatch(newNetworkState(connectionInfo.type, connectionInfo.effectiveType))
    });
    NetInfo.addEventListener(
      'connectionChange',
      (connectionInfo) => {
        dispatch(newNetworkState(connectionInfo.type, connectionInfo.effectiveType))
      }
    );
  }
}

export function stopLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.stop()
    BackgroundGeolocation.removeAllListeners('location')
    dispatch(clearLastLocation())
  }
}

function startAppStateTracking () {
  return async (dispatch) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
    })
  }
}

export function submitLogin (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      dispatch(dismissError())
      dispatch(toggleDoingInitialLoad())
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const followers = resp.followers
      console.log('login followers: ' + followers)
      const pouchCouch = new PouchCouch(token)
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      dispatch(receiveJWT(resp.token))
      dispatch(setAppRoot('after-login'))
      dispatch(saveUserID(resp.id))
      dispatch(loadLocalData())
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(changeScreen(FEED))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      } else if (e instanceof NotConnectedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function submitSignup (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      const pouchCouch = new PouchCouch(resp.token)
      await pouchCouch.replicateOwnUser(resp.id)
      dispatch(receiveJWT(resp.token))
      dispatch(setAppRoot('after-login'))
      dispatch(saveUserID(resp.id))
      dispatch(loadLocalData())
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function syncDBPull (db) {
  return async (dispatch, getState) => {
    console.log('syncDBPull')
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const userID = getState().localState.userID
    const following = Object.values(getState().follows).filter(
      f => !f.deleted && f.followerID === userID
    ).map(
      f => f.followingID
    )

    const followers = Object.values(getState().follows).filter(
      f => !f.deleted && f.followingID === userID
    ).map(
      f => f.followerID
    )
    console.log('followers: ' + followers)
    await pouchCouch.localReplicateDB(db, [...following, userID], followers)
    await dispatch(loadLocalData())
    dispatch(syncComplete())
  }
}

export function toggleRideCarrot (rideID) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const currentUserID = getState().localState.userID
    let existing = getState().rideCarrots.filter((c) => {
      return c.rideID === rideID && c.userID === currentUserID
    })
    existing = existing.length > 0 ? existing[0] : null
    if (existing) {
      let toggled = {...existing, deleted: !existing.deleted}
      const doc = await pouchCouch.saveRide(toggled)
      dispatch(rideCarrotSaved({...toggled, _rev: doc.rev}))
    } else {
      const carrotID = `${currentUserID}_${(new Date).getTime().toString()}`
      const newCarrot = {
        _id: carrotID,
        rideID,
        userID: currentUserID,
        deleted: false,
        type: 'carrot'
      }

      const doc = await pouchCouch.saveRide(newCarrot)
      dispatch(rideCarrotCreated({...newCarrot, _rev: doc.rev}))
    }
    dispatch(needsRemotePersist('rides'))
  }
}

export function updateHorse (horseDetails) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveHorse(horseDetails)
    dispatch(horseSaved({...horseDetails, _rev: doc.rev}))
    dispatch(needsRemotePersist('horses'))
  }
}

export function updateRide (rideDetails) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveRide(rideDetails)
    dispatch(rideSaved({...rideDetails, _rev: doc.rev}))
    dispatch(needsRemotePersist('rides'))
  }
}

export function updateUser (userDetails) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveUser(userDetails)
    dispatch(userUpdated({...userDetails, _rev: doc.rev}))
    dispatch(needsRemotePersist('users'))
  }
}

export function uploadHorsePhoto (photoLocation, horseID) {
  return async (dispatch) => {
    const photoID = generateUUID()
    dispatch(changeHorsePhotoData(horseID, photoID, photoLocation, false))
    enqueueHorsePhoto(photoLocation, photoID, horseID)
    dispatch(needsPhotoUpload('horse'))
  }
}

export function uploadProfilePhoto (photoLocation) {
  return async (dispatch) => {
    const profilePhotoID = generateUUID()
    dispatch(changeUserPhotoData(profilePhotoID, photoLocation))
    enqueueProfilePhoto(photoLocation, profilePhotoID)
    dispatch(needsPhotoUpload('profile'))
  }
}

export function uploadRidePhoto (photoID, photoLocation, rideID) {
  return async (dispatch) => {
    enqueueRidePhoto(photoLocation, photoID, rideID)
    dispatch(needsPhotoUpload('ride'))
  }
}


