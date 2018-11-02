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
import { appStates } from './helpers'
import { DRAWER, FEED, RECORDER, SIGNUP_LOGIN, UPDATE_NEW_RIDE_ID } from './screens'
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
  CREATE_FOLLOW,
  CREATE_HORSE,
  CREATE_RIDE,
  DEQUEUE_PHOTO,
  DELETE_FOLLOW,
  DELETE_UNPERSISTED_HORSE,
  DELETE_UNPERSISTED_RIDE,
  DISCARD_CURRENT_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_UPDATED,
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
  RIDE_COORDINATES_LOADED,
  RIDE_ELEVATIONS_UPDATED,
  RIDE_UPDATED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  SET_FEED_MESSAGE,
  SET_FIRST_START_HORSE_ID,
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

export function createRide (rideID, userID, currentRide, currentRideElevations, currentRideCoordinates) {
  return {
    type: CREATE_RIDE,
    currentRide,
    currentRideCoordinates,
    currentRideElevations,
    rideID,
    userID
  }
}

export function dequeuePhoto (photoID) {
  return {
    type: DEQUEUE_PHOTO,
    photoID
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

export function horseUpdated (horse) {
  return {
    type: HORSE_UPDATED,
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

function rideCoordinatesLoaded (rideCoordinates) {
  return {
    type: RIDE_COORDINATES_LOADED,
    rideCoordinates
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

export function setFirstStartHorseID (horseID) {
  return {
    type: SET_FIRST_START_HORSE_ID,
    horseID
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
  return (dispatch, getState) => {
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
    dispatch(horseUserUpdated(newHorseUser))
    dispatch(persistHorseUser(id))
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

export function changeHorsePhotoData(horseID, photoID, uri) {
  return async (dispatch, getState) => {
    let horse = getState().getIn(['pouchRecords', 'horses', horseID])
    let timestamp = unixTimeNow()
    if (horse.getIn(['photosByID', photoID])) {
      timestamp = horse.getIn(['photosByID', photoID, 'timestamp'])
    } else {
      horse = horse.set('profilePhotoID', photoID)
    }
    horse = horse.setIn(['photosByID', photoID], Map({timestamp, uri}))
    dispatch(horseUpdated(horse))
    dispatch(persistHorse(horse.get('_id')))
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
    dispatch(userUpdated(user))
    dispatch(persistUser(user.get('_id')))
  }
}

function configureBackgroundGeolocation () {
  return async () => {
    logInfo('configuring geolocation')
    // @TODO this should return a promise wrapped around callback
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

export function persistFollow (followID) {
  return async (dispatch, getState) => {
    const theFollow = getState().getIn(['pouchRecords', 'follows', followID])
    if (!theFollow) {
      throw new Error('no follow with that ID')
    }

    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(theFollow.toJS())

    let foundAfterSave = getState().getIn(['pouchRecords', 'follows', followID])
    dispatch(followUpdated(foundAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
    dispatch(syncDBPull())
  }
}

export function persistRide (rideID) {
  return async (dispatch, getState) => {
    const theRide = getState().getIn(['pouchRecords', 'rides', rideID])
    if (!theRide) {
      throw new Error('no ride with that ID')
    }

    const theElevations = getState().getIn(['pouchRecords', 'rideElevations', rideID + '_elevations'])
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const [rideDoc, elevationDoc] = await Promise.all([
      pouchCouch.saveRide(theRide.toJS()),
      pouchCouch.saveRide(theElevations.toJS())
    ])

    const theRideAfterSave = getState().getIn(['pouchRecords', 'rides', rideID])
    const theElevationsAfterSave = getState().getIn(['pouchRecords', 'rideElevations', rideID + '_elevations'])
    dispatch(rideElevationsUpdated(theElevationsAfterSave.set('_rev', elevationDoc.rev)))
    dispatch(rideUpdated(theRideAfterSave.set('_rev', rideDoc.rev)))
    dispatch(needsRemotePersist('rides'))
  }
}

export function persistRideCoordinates () {
  return async (dispatch, getState) => {
    const theCoordinates = getState().getIn(['pouchRecords', 'newRideCoordinates'])
    const pouchCouch = new PouchCouch()
    const coordinateDoc = await pouchCouch.saveRide(theCoordinates.toJS())
    dispatch(rideCoordinatesLoaded(theCoordinates.set('_rev', coordinateDoc)))
    dispatch(needsRemotePersist('rides'))
  }
}

export function persistUser (userID) {
  return async (dispatch, getState) => {
    const theUser = getState().getIn(['pouchRecords', 'users', userID])
    if (!theUser) {
      throw new Error('no user with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(theUser.toJS())

    const theUserAfterSave = getState().getIn(['pouchRecords', 'users', userID])
    dispatch(userUpdated(theUserAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function persistHorse (horseID) {
  return async (dispatch, getState) => {
    const theHorse = getState().getIn(['pouchRecords', 'horses', horseID])
    if (!theHorse) {
      throw new Error('no horse with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveHorse(theHorse.toJS())

    const theHorseAfterSave = getState().getIn(['pouchRecords', 'horses', horseID])
    dispatch(horseUpdated(theHorseAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function persistHorseUser (horseUserID) {
  return async (dispatch, getState) => {
    const theHorseUser = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    if (!theHorseUser) {
      throw new Error('no horse user with that ID')
    }
    const jwt = getState().getIn(['localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveHorse(theHorseUser.toJS())

    const theHorseUserAfterSave = getState().getIn(['pouchRecords', 'horseUsers', horseUserID])
    await dispatch(horseUserUpdated(theHorseUserAfterSave.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
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
    dispatch(horseUserUpdated(theHorseUser))
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

export function loadRideCoordinates (rideID) {
  return (dispatch) => {
    const pouchCouch = new PouchCouch()
    console.log('LOADING')
    pouchCouch.loadRideCoordinates(rideID).then((coords) => {
      console.log('LOADED')
      dispatch(rideCoordinatesLoaded(coords))
    })
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
  return (dispatch) => {
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
  return (dispatch) => {
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
  return (dispatch, getState) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
      const onRide = Boolean(getState().getIn(['currentRide', 'currentRide']))
      if (onRide && nextAppState === appStates.active) {
        const activeComponent = getState().getIn(['localState', 'activeComponent'])
        if (activeComponent !== RECORDER && activeComponent !== UPDATE_NEW_RIDE_ID) {
          Navigation.push(activeComponent, {
            component: {
              name: RECORDER,
              id: RECORDER
            }
          });
        }
      }
    })
  }
}

export function submitLogin (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(dismissError())
      dispatch(toggleDoingInitialLoad())
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const followers = resp.followers
      const pouchCouch = new PouchCouch(token)
      await pouchCouch.localReplicateDB('all', [...following, userID], followers)
      await dispatch(loadLocalData())
      dispatch(receiveJWT(resp.token))
      dispatch(switchRoot(FEED))
      dispatch(toggleDoingInitialLoad())
      dispatch(saveUserID(resp.id))
      dispatch(setSentryUserContext())
      dispatch(startListeningFCMTokenRefresh())
      dispatch(getFCMToken())
      dispatch(startListeningFCM())
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
    const [localState, currentRideState] = await Promise.all([
      await LocalStorage.loadLocalState(),
      await LocalStorage.loadCurrentRideState()
    ])
    if (localState) {
      dispatch(loadLocalState(localState))
    } else {
      logInfo('no cached local state found')
    }

    if (currentRideState) {
      dispatch(loadCurrentRideState(currentRideState))
    } else {
      logInfo('no cached current ride state found')
    }
  }
}

export function uploadHorsePhoto (photoID, photoLocation, horseID) {
  return async (dispatch) => {
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
  return (dispatch) => {
    dispatch(enqueuePhoto(Map({type: 'ride', photoLocation, photoID, rideID})))
  }
}


