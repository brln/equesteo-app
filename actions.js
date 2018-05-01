import { AppState, NetInfo } from 'react-native'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import Pusher from 'pusher-js/react-native';

import { unixTimeNow, appStates } from "./helpers"
import { FEED } from './screens'
import { LocalStorage, PouchCouch, UserAPI } from './services'
import {BadRequestError, UnauthorizedError} from "./errors"

import {
  CHANGE_ROOT,
  CHANGE_SCREEN,
  CLEAR_LAST_LOCATION,
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
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  PUSHER_LISTENING,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  RIDE_SAVED,
  SAVE_USER_ID,
  START_RIDE,
  USER_SAVED,
  USER_SEARCH_RETURNED,
} from './constants'

function changeAppRoot(root) {
  return {
    type: CHANGE_ROOT,
    root
  }
}

export function changeScreen(screen) {
  return {
    type: CHANGE_SCREEN,
    screen
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

export function errorOccurred (message) {
  return {
    type: ERROR_OCCURRED,
    message
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

function pusherListening (socketInstance) {
  return {
    type: PUSHER_LISTENING,
    socketInstance
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

function horseSaved (horse) {
  return {
    type: HORSE_SAVED,
    horse,
  }
}

export function remotePersistComplete (database) {
  return {
    type: REMOTE_PERSIST_COMPLETE,
    database
  }
}

function rideSaved (ride) {
  return {
    type: RIDE_SAVED,
    ride,
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

export function userSearchReturned (userSearchResults) {
  return {
    type: USER_SEARCH_RETURNED,
    userSearchResults,
  }
}

export function userSaved (userData) {
  return {
    type: USER_SAVED,
    userData,
  }
}

//  =========================================
// |<  FUNCTIONAL ACTIONS                |||>>
//  =========================================

export function appInitialized () {
  return async (dispatch) => {
    dispatch(findLocalToken())
    dispatch(changeAppRoot('login'))
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
    dispatch(startPusherListening())
  }
}

export function createFollow (followingID) {
  return async (dispatch, getState) => {
    let currentUser = null
    for (let user of getState().users) {
      if (user._id === getState().localState.userID) {
        currentUser = user
        break
      }
    }
    const newUserData = {...currentUser}
    newUserData.following.push(followingID)
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    await pouchCouch.saveUser(newUserData)
    dispatch(userSaved(newUserData))
    dispatch(needsRemotePersist('users'))
  }
}

export function deleteFollow (followingID) {
  return async (dispatch, getState) => {
    // const userAPI = new UserAPI(getState().jwt)
    // try {
    //   const following = await userAPI.deleteFollow(followingID)
    //   dispatch(saveUserData({...getState().userData, following}))
    // } catch (e) {
    //   console.log(e)
    //   alert('error in console')
    // }
    // @TODO: fix this
  }
}

function findLocalToken () {
  return async (dispatch) => {
    const storedToken = await LocalStorage.loadToken()
    if (storedToken !== null) {
      dispatch(receiveJWT(storedToken.token))
      dispatch(loadLocalData(storedToken.userID, storedToken.token))
    }
  }
}

function loadLocalData (userID, jwt) {
  return async (dispatch) => {
    const pouchCouch = new PouchCouch(jwt)
    const localData = await pouchCouch.localLoad()
    dispatch(localDataLoaded({
      ...localData,
      userID
    }))
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.findUser(phrase)
      dispatch(userSearchReturned(resp))
    } catch (e) {
      console.log(e)
    }
  }
}

export function saveHorse (horseData) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch(getState().localState.jwt)
    const doc = await pouchCouch.saveHorse(horseData)
    dispatch(horseSaved({...horseData, _id: doc.id, _rev: doc.rev}))
    dispatch(needsRemotePersist('horses'))
  }
}

export function saveRide (rideData) {
  return async (dispatch, getState) => {
    const pouchCouch = new PouchCouch()
    const theRide = {
      ...getState().localState.currentRide,
      ...rideData
    }
    const doc = await pouchCouch.saveRide(theRide)
    dispatch(rideSaved({...theRide, _id: doc.id, _rev: doc.rev}))
    dispatch(needsRemotePersist('rides'))
  }
}

export function signOut () {
  return async(dispatch) => {
    await LocalStorage.deleteToken()
    const pouchCouch = new PouchCouch()
    await pouchCouch.deleteLocalDBs()
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
      notificationTitle: 'You\'re out on a ride a ride.',
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

function startPusherListening () {
  return async (dispatch) => {
    const pusher = new Pusher('6f49bf77389d2688ed5f', {
      cluster: 'us2',
      encrypted: true
    });
    dispatch(pusherListening(pusher))
    const channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      alert(data.message);
    });
  }
}

function stopPusherListening () {
  return async (dispatch, getState) => {
    const pusherSocket = getState().localState.pusherSocket
    pusherSocket.disconnect()
    dispatch(pusherListening(null))
  }
}

export function stopLocationTracking () {
  return async (dispatch) => {
    BackgroundGeolocation.stop()
    dispatch(clearLastLocation())
  }
}

function startAppStateTracking () {
  return async (dispatch, getState) => {
    AppState.addEventListener('change', (nextAppState) => {
      dispatch(newAppState(nextAppState))
      const pusherListening = getState().localState.pusherSocket
      if (nextAppState === appStates.background && pusherListening) {
        dispatch(stopPusherListening())
      } else if (nextAppState === appStates.inactive && pusherListening) {
        dispatch(stopPusherListening)
      } else if (nextAppState === appStates.active && !pusherListening) {
        dispatch(startPusherListening())
      }
    })
  }
}

export function submitLogin (email, password) {
  return async (dispatch) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      const token = resp.token
      const userID = resp.id
      const following = resp.following
      const pouchCouch = new PouchCouch(token)
      await pouchCouch.localReplicate([...following, userID])
      dispatch(loadLocalData(userID, token))
      await LocalStorage.saveToken(resp.token, resp.id);
      dispatch(receiveJWT(resp.token))
      dispatch(changeScreen(FEED))
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function submitSignup (email, password) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      await LocalStorage.saveToken(resp.token, resp.id);
      const pouchCouch = new PouchCouch(resp.token)
      await pouchCouch.replicateOwnUser(resp.id)
      dispatch(loadLocalData(resp.id, resp.token))
      dispatch(saveUserID(resp.id))
      dispatch(receiveJWT(resp.token))
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function uploadProfilePhoto (photoLocation) {
  return async (dispatch, getState) => {
    const userAPI = new UserAPI(getState().jwt)
    try {
      const resp = await userAPI.uploadProfilePhoto(photoLocation)
      // dispatch(receiveUserData(resp))
    } catch (e) {
      debugger
    }
  }
}


