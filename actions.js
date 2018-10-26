import { AppState, NetInfo } from 'react-native'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import { ENV } from 'react-native-dotenv'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'
import { fromJS, Map, List } from 'immutable'
import { Sentry } from 'react-native-sentry'
import kalmanFilter from './services/Kalman'

import {
  haversine,
  logError,
  logInfo,
  unixTimeNow,
  generateUUID,
  toElevationKey,
} from "./helpers"
import { danger, green, warning } from './colors'
import { DRAWER, FEED, SIGNUP_LOGIN } from './screens'
import { LocalStorage, PouchCouch, UserAPI } from './services'
import {BadRequestError, NotConnectedError, UnauthorizedError} from "./errors"
import {
  AWAIT_FULL_SYNC,
  CLEAR_FEED_MESSAGE,
  CLEAR_LAST_LOCATION,
  CLEAR_PAUSED_LOCATIONS,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  CREATE_RIDE,
  DEQUEUE_PHOTO,
  DELETE_UNPERSISTED_RIDE,
  DISCARD_CURRENT_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_CREATED,
  HORSE_SAVED,
  HORSE_USER_UPDATED,
  LOAD_CURRENT_RIDE_STATE,
  LOAD_LOCAL_STATE,
  LOCAL_DATA_LOADED,
  MERGE_STASHED_LOCATIONS,
  NEEDS_REMOTE_PERSIST,
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  PAUSE_LOCATION_TRACKING,
  POP_SHOW_RIDE_SHOWN,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  REMOTE_PERSIST_ERROR,
  REMOTE_PERSIST_STARTED,
  REPLACE_LAST_LOCATION,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COMMENT_CREATED,
  RIDE_ELEVATIONS_UPDATED,
  RIDE_UPDATED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_FEED_MESSAGE,
  SET_FULL_SYNC_FAIL,
  SET_POP_SHOW_RIDE,
  SHOW_POP_SHOW_RIDE,
  START_RIDE,
  STASH_NEW_LOCATIONS,
  STOP_STASH_NEW_LOCATIONS,
  SYNC_COMPLETE,
  TOGGLE_AWAITING_PW_CHANGE,
  TOGGLE_DOING_INITIAL_LOAD,
  UNPAUSE_LOCATION_TRACKING,
  USER_UPDATED,
  USER_SEARCH_RETURNED,
} from './constants'

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

export function dequeuePhoto (photoID) {
  return {
    type: DEQUEUE_PHOTO,
    photoID
  }
}

export function deleteUnpersistedRide (rideID) {
  return {
    type: DELETE_UNPERSISTED_RIDE,
    rideID
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

export function horseSaved (horse) {
  return {
    type: HORSE_SAVED,
    horse
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

function horseCreated (horse) {
  return {
    type: HORSE_CREATED,
    horse,
  }
}

function horseUserUpdated (horseUser) {
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

export function setRemotePersistDB (database) {
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

export function newLocation (location, elevation) {
  return {
    type: NEW_LOCATION,
    location,
    elevation,
  }
}

function newNetworkState (connectionType, effectiveConnectionType) {
  return {
    type: NEW_NETWORK_STATE,
    connectionType,
    effectiveConnectionType,
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

function receiveJWT (token) {
  return {
    type: RECEIVE_JWT,
    token
  }
}

export function setPopShowRide (rideID, showRideNow) {
  return {
    type: SET_POP_SHOW_RIDE,
    rideID,
    showRideNow,
  }
}

export function showPopShowRide () {
  return {
    type: SHOW_POP_SHOW_RIDE,
  }
}

export function setRemotePersistStarted () {
  return {
    type: REMOTE_PERSIST_STARTED
  }
}

export function stashNewLocations () {
  return {
    type: STASH_NEW_LOCATIONS
  }
}

export function stopStashNewLocations () {
  return {
    type: STOP_STASH_NEW_LOCATIONS
  }
}

export function replaceLastLocation (newLocation, newElevation) {
  return {
    type: REPLACE_LAST_LOCATION,
    newLocation,
    newElevation,
  }
}

export function setRemotePersistComplete (database) {
  return {
    type: REMOTE_PERSIST_COMPLETE,
    database
  }
}

export function setRemotePersistError () {
  return {
    type: REMOTE_PERSIST_ERROR,
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

export function rideUpdated (ride) {
  return {
    type: RIDE_UPDATED,
    ride
  }
}

function rideElevationsUpdated (rideElevations) {
  return {
    type: RIDE_ELEVATIONS_UPDATED,
    rideElevations
  }
}

export function saveUserID(userID) {
  return {
    type: SAVE_USER_ID,
    userID
  }
}

function setActiveComponent (componentID) {
  return {
    logData: ['componentID'],
    type: SET_ACTIVE_COMPONENT,
    componentID
  }
}

export function startRide(firstCoord, firstElevation, startTime) {
  const coords = []
  let elevations = Map()
  if (firstCoord) {
    coords.push(firstCoord)
    elevations = elevations.setIn([
      toElevationKey(firstElevation.get('latitude')),
      toElevationKey(firstElevation.get('longitude'))
    ], firstElevation.get('elevation'))
  }
  return {
    type: START_RIDE,
    currentRide: Map({
      rideCoordinates: List(coords),
      distance: 0,
      startTime,
      pausedTime: 0,
      lastPauseStart: null
    }),
    currentElevations: Map({
      elevationGain: 0,
      elevations
    })
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

export function unpauseLocationTracking () {
  return {
    type: UNPAUSE_LOCATION_TRACKING
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
export function addHorseUser (horse, user) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const id = `${user.get('_id')}_${horse.get('_id')}`
    let newHorseUser = getState().getIn(['pouchRecords', 'horseUsers', id])
    if (newHorseUser) {
      newHorseUser = newHorseUser.set('deleted', false)
    } else {
      newHorseUser = Map({
        _id: id,
        type: 'horseUser',
        horseID: horse.get('_id'),
        userID: user.get('_id'),
        owner: false,
        createTime: unixTimeNow(),
        deleted: false,
      })
    }
    const joinDoc = await pouchCouch.saveHorse(newHorseUser.toJS())
    const joinMap = newHorseUser.set('_rev', joinDoc.rev)
    dispatch(horseUserUpdated(joinMap))
    dispatch(needsRemotePersist('horses'))
  }
}

export function appInitialized () {
  return async (dispatch) => {
    await dispatch(tryToLoadStateFromDisk())
    dispatch(startActiveComponentListener())
    dispatch(dismissError())
    dispatch(checkFCMPermission())
    dispatch(findLocalToken())
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
  }
}

export function changeHorsePhotoData(horseID, photoID, uri) {
  return async (dispatch, getState) => {
    let horse = getState().getIn(['pouchRecords', 'horses']).get(horseID)

    let timestamp = unixTimeNow()
    if (horse.getIn(['photosByID', photoID])) {
      timestamp = horse.getIn(['photosByID', photoID, 'timestamp'])
    } else {
      horse = horse.set('profilePhotoID', photoID)
    }
    horse = horse.setIn(['photosByID', photoID], Map({timestamp, uri}))
    dispatch(saveHorse(horse))
  }
}

export function getPWCode (email) {
  return async () => {
    let userAPI = new UserAPI()
    await userAPI.getPWCode(email)
  }
}

export function getFCMToken () {
  return async (dispatch) => {
    let fcmToken
    try {
      fcmToken = await firebase.messaging().getToken();
    } catch (e) {
      logInfo('no token available')
    }
    if (fcmToken) {
      dispatch(setFCMTokenOnServer(fcmToken))
    }
  }
}

export function checkFCMPermission () {
  return async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (!enabled) {
      try {
        const resp = await firebase.messaging().requestPermission();
      } catch (error) {
        alert('YOU HAVE TO.')
        throw error
      }
    }

  }
}



export function changeRidePhotoData(rideID, photoID, uri) {
  return async (dispatch, getState) => {
    let ride = getState().getIn(['pouchRecords', 'rides']).get(rideID)

    let timestamp = unixTimeNow()
    if (ride.getIn(['photosByID', photoID])) {
      timestamp = ride.getIn(['photosByID', photoID, 'timestamp'])
    } else {
      ride = ride.set('profilePhotoID', photoID)
    }
    ride = ride.setIn(['photosByID', photoID], Map({timestamp, uri}))
    dispatch(rideUpdated(ride))
    dispatch(persistRide(ride.get('_id')))
  }
}

export function changeUserPhotoData (photoID, uri) {
  return async (dispatch, getState) => {
    const currentUserID = getState().getIn(['localState', 'userID'])
    let user = getState().getIn(['pouchRecords', 'users', currentUserID])

    let timestamp = unixTimeNow()
    if (user.getIn(['photosByID', photoID])) {
      timestamp = user.getIn(['photosByID', photoID, 'timestamp'])
    } else {
      user = user.set('profilePhotoID', photoID)
    }
    user = user.setIn(['photosByID', photoID], Map({timestamp, uri}))
    dispatch(updateUser(user))
  }
}

function configureBackgroundGeolocation () {
  return async () => {
    logInfo('configuring geolocation')
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      locationProvider: BackgroundGeolocation.RAW_PROVIDER,
      distanceFilter: 0,
      maxLocations: 10,
      interval: 0,
      notificationTitle: 'You\'re out on a ride.',
      notificationText: 'Tap here to see your progress.',
    });
  }
}

export function createHorse (horse, isDefault) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)

    const newHorse = {
      _id: horse.get('_id'),
      breed: horse.get('breed'),
      birthDay: horse.get('birthDay'),
      birthMonth: horse.get('birthMonth'),
      birthYear: horse.get('birthYear'),
      createTime: unixTimeNow(),
      description: horse.get('description'),
      heightHands: horse.get('heightHands'),
      heightInches: horse.get('heightInches'),
      name: horse.get('name'),
      profilePhotoID: horse.get('profilePhotoID'),
      photosByID: horse.get('photosByID'),
      sex: horse.get('sex'),
      type: 'horse'
    }

    let isFirstHorse = getState().getIn(['pouchRecords', 'horseUsers']).valueSeq().filter((hu) => {
      return hu.get('userID') === horse.get('userID') && hu.get('deleted') !== true
    }).count() === 0
    const newHorseUser = {
      _id: `${horse.get('userID')}_${newHorse._id}`,
      type: 'horseUser',
      horseID: newHorse._id,
      userID: horse.get('userID'),
      owner: true,
      createTime: unixTimeNow(),
      deleted: false,
      rideDefault: isFirstHorse ? isFirstHorse : isDefault,
    }
    const horseDoc = await pouchCouch.saveHorse(newHorse)
    const joinDoc = await pouchCouch.saveHorse(newHorseUser)
    const horseMap = Map({...newHorse, _rev: horseDoc.rev})
    const joinMap = Map({...newHorseUser, _rev: joinDoc.rev})
    dispatch(horseCreated(horseMap))
    dispatch(horseUserUpdated(joinMap))
    dispatch(needsRemotePersist('horses'))

    horseMap.get('photosByID').forEach((photoInfo, photoID) => {
      dispatch(enqueuePhoto(Map({
        type: 'horse',
        photoLocation: photoInfo.get('uri'),
        photoID,
        horseID: horse.get('_id')
      })))
    })
  }
}

export function createRide (rideID, userID, currentRide, currentRideElevations) {
  return {
    type: CREATE_RIDE,
    currentRide,
    currentRideElevations,
    rideID,
    userID
  }
}

export function persistRide (rideID) {
  return async (dispatch, getState) => {
    const theRide = getState().getIn(['pouchRecords', 'rides', rideID])
    const theElevations = getState().getIn(['pouchRecords', 'rideElevations', rideID + '_elevations'])
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const rideDoc = await pouchCouch.saveRide(theRide.toJS())
    const elevationDoc = await pouchCouch.saveRide(theElevations.toJS())
    dispatch(rideElevationsUpdated(theElevations.set('_rev', elevationDoc.rev)))
    dispatch(rideUpdated(theRide.set('_rev', rideDoc.rev)))
    dispatch(needsRemotePersist('rides'))
  }
}

export function createRideComment(commentData) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentUserID = getState().getIn(['localState', 'userID'])
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
    dispatch(rideCommentCreated(Map(newComment).set('_rev', doc.rev)))
    dispatch(needsRemotePersist('rides'))
  }
}

export function createFollow (followingID) {
  return async (dispatch, getState) => {
    const userID = getState().getIn(['localState', 'userID'])
    const followID = `${userID}_${followingID}`
    let found = getState().getIn(['pouchRecords', 'follows', followID])
    if (!found) {
      found = Map({
        _id: followID,
        followingID,
        followerID: userID,
        deleted: false,
        type: "follow"
      })
    } else {
      found = found.set('deleted', false)
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(found.toJS())
    await dispatch(followUpdated(found.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
    dispatch(syncDBPull())
  }
}

export function deleteFollow (followingID) {
  return async (dispatch, getState) => {
    const userID = getState().getIn(['localState', 'userID'])
    const followID = `${userID}_${followingID}`
    let found = getState().getIn(['pouchRecords', 'follows', followID]).set('deleted', true)

    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(found.toJS())
    await dispatch(followUpdated(found.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function deleteHorseUser (horseID, userID) {
  return async (dispatch, getState) => {
    const filterHorseUser = getState().getIn(['pouchRecords', 'horseUsers']).valueSeq().filter(hu => {
      return hu.get('horseID') === horseID && hu.get('userID') === userID
    })
    if (filterHorseUser.count() !== 1) {
      throw Error('Could not find horseUser')
    }
    let theHorseUser = filterHorseUser.get(0)
    theHorseUser = theHorseUser.set('deleted', true)
    dispatch(updateHorseUser(theHorseUser))
  }
}

export function updateHorseUser (horseUser) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const asJS = horseUser.toJS()
    const doc = await pouchCouch.saveHorse(asJS)
    await dispatch(horseUserUpdated(horseUser.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function exchangePWCode (email, code) {
  return async (dispatch) => {
    let userAPI = new UserAPI()
    try {
      const resp = await userAPI.exchangePWCodeForToken(email, code)
      dispatch(dismissError())
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const followers = resp.followers
      const pouchCouch = new PouchCouch(token)
      dispatch(toggleAwaitingPasswordChange())
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      dispatch(receiveJWT(resp.token))
      dispatch(saveUserID(resp.id))
      dispatch(setSentryUserContext())
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
      await LocalStorage.saveToken(resp.token, resp.id);
    } catch (e) {
      logError(e)
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function needsRemotePersist(db) {
  return async (dispatch) => {
    dispatch(setFeedMessage(Map({
      message: 'Data Needs to Upload',
      color: warning,
      timeout: false
    })))
    dispatch(setRemotePersistDB(db))
  }
}

function switchRoot (newRoot) {
  return async () => {
    if (newRoot === FEED) {
      Navigation.setRoot({
        root: {
          sideMenu: {
            left: {
              visible: true,
              component: {name: DRAWER, id: DRAWER}
            },
            center: {
              stack: {
                children: [{
                  component: {
                    name: FEED,
                    id: FEED,
                    options: {
                      topBar: {
                        elevation: 0
                      }
                    }
                  },
                }]
              }
            },
          }
        }
      });
    } else if (newRoot === SIGNUP_LOGIN) {
      Navigation.setRoot({
        root: {
          component: {
            name: SIGNUP_LOGIN,
            id: SIGNUP_LOGIN
          },
        }
      });
    } else {
      throw Error('That\'s a bad route, jerk.')
    }
  }
}

function findLocalToken () {
  return async (dispatch) => {
    const storedToken = await LocalStorage.loadToken()
    if (storedToken !== null) {
      dispatch(receiveJWT(storedToken.token))
      dispatch(saveUserID(storedToken.userID))
      dispatch(setSentryUserContext())
      dispatch(switchRoot(FEED))
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
      dispatch(syncDBPull('all'))
    } else {
      dispatch(switchRoot(SIGNUP_LOGIN))
    }
  }
}

function loadLocalData () {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    try {
      const localData = await pouchCouch.localLoad()
      dispatch(localDataLoaded(localData))
    } catch (e) {
      logError(e)
      throw e
    }
  }
}

export function newPassword (password) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    try {
      await userAPI.changePassword(password)
      dispatch(switchRoot(FEED))
    } catch (e) {
      logError(e)
    }
  }
}

export function remotePersistComplete (db) {
  return async (dispatch) => {
    dispatch(setRemotePersistComplete(db))
    dispatch(setFeedMessage(Map({
      message: 'All Data Uploaded',
      color: green,
      timeout: 3000
    })))
  }
}

export function remotePersistError () {
  return async (dispatch) => {
    dispatch(setRemotePersistError())
    dispatch(setFeedMessage(Map({
      message: 'Can\'t Upload Data',
      color: danger,
      timeout: false
    })))
  }
}

export function remotePersistStarted () {
  return async (dispatch) => {
    dispatch(setRemotePersistStarted())
    dispatch(setFeedMessage(Map({
      message: 'Data Uploading',
      color: warning,
      timeout: false
    })))
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    try {
      const resp = await userAPI.findUser(phrase)
      dispatch(userSearchReturned(fromJS(resp)))
    } catch (e) {
      logError(e)
    }
  }
}

export function setSentryUserContext () {
  return async (dispatch, getState) => {
    const userID = getState().getIn(['localState', 'userID'])
    Sentry.setUserContext({
      userID,
    });
  }
}

export function saveHorse (horse) {
  return async (dispatch) => {
    const pouchCouch = new PouchCouch()
    const doc = await pouchCouch.saveHorse(horse.toJS())
    dispatch(horseSaved(horse.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function setFCMTokenOnServer (token) {
  return async (_, getState) => {
    try {
      const jwt = getState().getIn(['localState', 'jwt'])
      const userAPI = new UserAPI(jwt)
      const currentUserID = getState().getIn(['localState', 'userID'])
      await userAPI.setFCMToken(currentUserID, token)
    } catch (e) {
      logError('Could not set FCM token')
    }
  }
}

export function signOut () {
  return async(dispatch) => {
    await LocalStorage.deleteToken()
    await LocalStorage.deleteLocalState()
    const pouchCouch = new PouchCouch()
    await pouchCouch.deleteLocalDBs()
    dispatch(stopListeningFCM())
    dispatch(stopLocationTracking())
    dispatch(clearStateAfterPersist())
    dispatch(switchRoot(SIGNUP_LOGIN))
  }
}

export function startLocationTracking () {
  return async (dispatch, getState) => {
    logInfo('action: startLocationTracking')
    await configureBackgroundGeolocation()()
    const KALMAN_FILTER_Q = 6
    BackgroundGeolocation.on('location', (location) => {
      const lastLocation = getState().getIn(['currentRide', 'lastLocation'])
      let timeDiff = 0
      if (lastLocation) {
        timeDiff = (location.time / 1000) - (lastLocation.get('timestamp') / 1000)
      }

      if (!lastLocation || timeDiff > 5) {
        const refiningLocation = getState().getIn(['currentRide', 'refiningLocation'])

        let parsedLocation = Map({
          accuracy: location.accuracy,
          latitude: location.latitude,
          longitude: location.longitude,
          provider: location.provider,
          timestamp: location.time,
          speed: location.speed,
        })

        let parsedElevation = Map({
          latitude: location.latitude,
          longitude: location.longitude,
          elevation: location.altitude,
        })

        let replaced = false
        if (refiningLocation && lastLocation) {
          parsedLocation = kalmanFilter(
            parsedLocation,
            lastLocation,
            KALMAN_FILTER_Q
          )
          parsedElevation = parsedElevation.set(
            'latitude', parsedLocation.get('latitude')
          ).set(
            'longitude', parsedLocation.get('longitude')
          ).set(
            'accuracy', parsedLocation.get('accuracy')
          )

          let distance = haversine(
            refiningLocation.get('latitude'),
            refiningLocation.get('longitude'),
            parsedLocation.get('latitude'),
            parsedLocation.get('longitude')
          )
          if (distance < (30 / 5280)) {
            dispatch(replaceLastLocation(parsedLocation, parsedElevation))
            replaced = true
          }
        }
        if (!replaced) {
          dispatch(newLocation(parsedLocation, parsedElevation))
        }
      }
    })

    BackgroundGeolocation.on('error', (error) => {
      logError('[ERROR] BackgroundGeolocation error:', error);
      Sentry.captureException(new Error(JSON.stringify(error)))
    });

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

function startListeningFCM () {
  return async (dispatch, getState) => {
    PushNotification.configure({
      onNotification: async () => {
        await dispatch(syncDBPull())
        dispatch(showPopShowRide())
      }
    })

    firebase.messaging().onMessage(async (m) => {
      const userID = m._data.userID
      const distance = parseFloat(m._data.distance)
      const rideID = m._data.rideID
      const user = getState().getIn(['pouchRecords', 'users']).get(userID)
      const message = `${user.get('firstName')} went for a ${distance.toFixed(1)} mile ride!`
      dispatch(awaitFullSync())
      dispatch(setPopShowRide(rideID, false))
      await dispatch(syncDBPull())
      PushNotification.localNotification({
        message: message,
      })
    })
  }
}

function startListeningFCMTokenRefresh () {
  return async (dispatch, getState) => {
    firebase.messaging().onTokenRefresh(async (newToken) => {
      dispatch(setFCMTokenOnServer(newToken))
    })
  }
}

function startActiveComponentListener () {
  return async (dispatch) => {
    Navigation.events().registerComponentDidAppearListener( ( { componentId } ) => {
      if (componentId !== DRAWER) {
        dispatch(setActiveComponent(componentId))
      }
    })
  }
}

export function stopLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.stop()
    BackgroundGeolocation.removeAllListeners('location')
    dispatch(clearLastLocation())
  }
}

function stopListeningFCM () {
  return async () => {
    // maybe delete token on server here?
    await firebase.iid().deleteToken('373350399276', 'GCM')
    firebase.messaging().onTokenRefresh(() => {})
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
      const pouchCouch = new PouchCouch(token)
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      dispatch(receiveJWT(resp.token))
      dispatch(switchRoot(FEED))
      dispatch(toggleDoingInitialLoad())
      dispatch(saveUserID(resp.id))
      dispatch(setSentryUserContext())
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
      await LocalStorage.saveToken(resp.token, resp.id);
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
      dispatch(dismissError())
      dispatch(toggleDoingInitialLoad())
      await LocalStorage.saveToken(resp.token, resp.id);
      const following = resp.following
      const userID = resp.id
      const pouchCouch = new PouchCouch(resp.token)
      await pouchCouch.localReplicateDB('all', [...following, userID], [])
      dispatch(receiveJWT(resp.token))
      dispatch(switchRoot(FEED))
      dispatch(toggleDoingInitialLoad())
      dispatch(saveUserID(resp.id))
      dispatch(setSentryUserContext())
      await dispatch(loadLocalData())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function syncDBPull () {
  return async (dispatch, getState) => {
    logInfo('action syncDBPull')
    dispatch(setFeedMessage(Map({
      message: 'Loading New Rides',
      color: warning,
      timeout: null
    })))
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const userID = getState().getIn(['localState', 'userID'])
    const follows = getState().getIn(['pouchRecords', 'follows'])
    const following = follows.valueSeq().filter(
      f => !f.get('deleted') && f.get('followerID') === userID
    ).map(
      f => f.get('followingID')
    ).toJS()

    const followers = follows.valueSeq().filter(
      f => !f.get('deleted') && f.get('followingID') === userID
    ).map(
      f => f.get('followerID')
    ).toJS()
    following.push(userID)
    try {
      dispatch(setFullSyncFail(false))
      await pouchCouch.localReplicateDB('all', following, followers)
      await dispatch(loadLocalData())
      dispatch(syncComplete())
      dispatch(setFeedMessage(Map({
        message: 'All Rides Loaded!',
        color: green,
        timeout: 3000
      })))
    } catch (e) {
      dispatch(setFeedMessage(Map({
        message: 'Error Fetching Data',
        color: warning,
        timeout: 3000
      })))
      dispatch(setFullSyncFail(true))
    }
  }
}

export function toggleRideCarrot (rideID) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentUserID = getState().getIn(['localState', 'userID'])
    let existing = getState().getIn(['pouchRecords', 'rideCarrots']).valueSeq().filter((c) => {
      return c.get('rideID') === rideID && c.get('userID') === currentUserID
    })
    existing = existing.count() > 0 ? existing.get(0) : null
    if (existing) {
      let toggled = existing.set('deleted', !existing.get('deleted'))
      const doc = await pouchCouch.saveRide(toggled.toJS())
      dispatch(rideCarrotSaved(toggled.set('_rev', doc.rev)))
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
      dispatch(rideCarrotCreated(Map(newCarrot).set('_rev', doc.rev)))
    }
    dispatch(needsRemotePersist('rides'))
  }
}

export function tryToLoadStateFromDisk () {
  return async (dispatch) => {
    const localState = await LocalStorage.loadLocalState()
    const currentRideState = await LocalStorage.loadCurrentRideState()
    if (localState) {
      dispatch(loadLocalState(localState))
    } else {
      logInfo('no cached local state found')
    }

    if (currentRideState) {
      logDebug(currentRideState.toJSON(), 'tryToLoadCurrentRideState')
      dispatch(loadCurrentRideState(currentRideState))
    } else {
      logInfo('no cached current ride state found')
    }
  }
}

export function updateHorse (horseDetails) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const asJS = horseDetails.toJS()
    const doc = await pouchCouch.saveHorse(asJS)
    dispatch(horseSaved(horseDetails.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function updateUser (userDetails) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(userDetails.toJS())
    dispatch(userUpdated(userDetails.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function uploadHorsePhoto (photoLocation, horseID) {
  return async (dispatch) => {
    const photoID = generateUUID()
    dispatch(changeHorsePhotoData(horseID, photoID, photoLocation))
    dispatch(enqueuePhoto(Map({type: 'horse', photoLocation, photoID, horseID})))
  }
}

export function uploadProfilePhoto (photoLocation) {
  return async (dispatch) => {
    const photoID = generateUUID()
    dispatch(changeUserPhotoData(photoID, photoLocation))
    dispatch(enqueuePhoto(Map({type: 'profile', photoLocation, photoID})))
  }
}

export function uploadRidePhoto (photoID, photoLocation, rideID) {
  return async (dispatch) => {
    dispatch(enqueuePhoto(Map({type: 'ride', photoLocation, photoID, rideID})))
  }
}


