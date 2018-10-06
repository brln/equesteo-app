import { AppState, NetInfo } from 'react-native'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'
import { ENV } from 'react-native-dotenv'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'
import PushNotification from 'react-native-push-notification'
import { fromJS, Map, List } from 'immutable'
import { Sentry } from 'react-native-sentry'

import {
  haversine,
  logError,
  logInfo,
  unixTimeNow,
  generateUUID,
  staticMap
} from "./helpers"
import { DRAWER, FEED, SIGNUP_LOGIN } from './screens'
import { LocalStorage, PouchCouch, UserAPI } from './services'
import {BadRequestError, NotConnectedError, UnauthorizedError} from "./errors"
import {
  CLEAR_LAST_LOCATION,
  CLEAR_PAUSED_LOCATIONS,
  CLEAR_SEARCH,
  CLEAR_STATE,
  CLEAR_STATE_AFTER_PERSIST,
  DEQUEUE_PHOTO,
  DISCARD_RIDE,
  DISMISS_ERROR,
  ENQUEUE_PHOTO,
  ERROR_OCCURRED,
  FOLLOW_UPDATED,
  HORSE_CREATED,
  HORSE_SAVED,
  HORSE_USER_UPDATED,
  LOAD_LOCAL_STATE,
  LOCAL_DATA_LOADED,
  MERGE_PAUSED_LOCATIONS,
  NEEDS_REMOTE_PERSIST,
  NEW_LOCATION,
  NEW_APP_STATE,
  NEW_NETWORK_STATE,
  PAUSE_LOCATION_TRACKING,
  POP_SHOW_RIDE_SHOWN,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  REPLACE_LAST_LOCATION,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_COMMENT_CREATED,
  RIDE_CREATED,
  RIDE_SAVED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  START_RIDE,
  SYNC_COMPLETE,
  TOGGLE_AWAITING_PW_CHANGE,
  TOGGLE_DOING_INITIAL_LOAD,
  UNPAUSE_LOCATION_TRACKING,
  USER_UPDATED,
  USER_SEARCH_RETURNED,
} from './constants'

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

export function mergePausedLocations () {
  return {
    type: MERGE_PAUSED_LOCATIONS,
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

export function replaceLastLocation (newLocation) {
  return {
    type: REPLACE_LAST_LOCATION,
    newLocation
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

export function startRide(firstCoord) {
  const coords = []
  if (firstCoord) {
    coords.push(firstCoord)
  }
  return {
    type: START_RIDE,
    currentRide: Map({
      rideCoordinates: List(coords),
      distance: 0,
      startTime: unixTimeNow()
    }),
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
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const id = `${user.get('_id')}_${horse.get('_id')}`
    let newHorseUser = getState().getIn(['main', 'horseUsers', id])
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
    await dispatch(tryToLoadLocalState())
    dispatch(startActiveComponentListener())
    dispatch(dismissError())
    dispatch(findLocalToken())
    dispatch(checkFCMPermission())
    dispatch(startNetworkTracking())
    dispatch(startAppStateTracking())
  }
}

export function changeHorsePhotoData(horseID, photoID, uri) {
  return async (dispatch, getState) => {
    let horse = getState().getIn(['main', 'horses']).get(horseID)

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
  return async (dispatch, getState) => {
    let fcmToken
    try {
      fcmToken = await firebase.messaging().getToken();
    } catch (e) {
      logError(e)
    }
    const currentUserID = getState().getIn(['main', 'localState', 'userID'])
    const localUser = getState().getIn(['main', 'users', currentUserID])
    if (fcmToken && localUser) {
      if (fcmToken !== localUser.get('fcmToken')) {
        dispatch(updateUser(localUser.set('fcmToken', fcmToken)))
      } else {
        logInfo('Token unchanged')
      }
    } else {
      logError('cant get FCM token or user for some reason')
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
      dispatch(getFCMToken())
      await LocalStorage.saveToken(resp.token, resp.id);
    } catch (e) {
      logError(e)
      if (e instanceof UnauthorizedError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function changeRidePhotoData(rideID, photoID, uri) {
  return async (dispatch, getState) => {
    let ride = getState().getIn(['main', 'rides']).get(rideID)

    let timestamp = unixTimeNow()
    if (ride.getIn(['photosByID', photoID])) {
      timestamp = ride.getIn(['photosByID', photoID, 'timestamp'])
    } else {
      ride = ride.set('profilePhotoID', photoID)
    }
    ride = ride.setIn(['photosByID', photoID], Map({timestamp, uri}))
    dispatch(saveRide(ride))
  }
}

export function changeUserPhotoData (photoID, uri) {
  return async (dispatch, getState) => {
    const currentUserID = getState().getIn(['main', 'localState', 'userID'])
    let user = getState().getIn(['main', 'users']).get(currentUserID)

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

export function createHorse (horse) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
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
    const newHorseUser = {
      _id: `${horse.get('userID')}_${newHorse._id}`,
      type: 'horseUser',
      horseID: newHorse._id,
      userID: horse.get('userID'),
      owner: true,
      createTime: unixTimeNow(),
      deleted: false,
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

export function createRide (rideData) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentRide = getState().getIn(['main', 'localState', 'currentRide'])
    const theRide = {
      _id: rideData.get('_id'),
      coverPhotoID: rideData.get('coverPhotoID'),
      distance: currentRide.get('distance'),
      elapsedTimeSecs: rideData.get('elapsedTimeSecs'),
      horseID: rideData.get('horseID'),
      isPublic: rideData.get('isPublic'),
      name: rideData.get('name'),
      notes: rideData.get('notes'),
      photosByID: rideData.get('photosByID'),
      rideCoordinates: currentRide.get('rideCoordinates'),
      startTime: currentRide.get('startTime'),
      type: 'ride',
      userID: rideData.get('userID'),
    }
    theRide.mapURL = staticMap(theRide)
    const doc = await pouchCouch.saveRide(theRide)
    dispatch(rideCreated(Map({...theRide, _rev: doc.rev})))
    dispatch(needsRemotePersist('rides'))
  }
}

export function createRideComment(commentData) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentUserID = getState().getIn(['main', 'localState', 'userID'])
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
    const userID = getState().getIn(['main', 'localState', 'userID'])
    const followID = `${userID}_${followingID}`
    let found = getState().getIn(['main', 'follows', followID])
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
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(found.toJS())
    await dispatch(followUpdated(found.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
    dispatch(syncDBPull('all'))
  }
}

export function deleteFollow (followingID) {
  return async (dispatch, getState) => {
    const userID = getState().getIn(['main', 'localState', 'userID'])
    const followID = `${userID}_${followingID}`
    let found = getState().getIn(['main', 'follows', followID]).set('deleted', true)

    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveUser(found.toJS())
    await dispatch(followUpdated(found.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('users'))
  }
}

export function deleteHorseUser (horseID, userID) {
  return async (dispatch, getState) => {
    const filterHorseUser = getState().getIn(['main', 'horseUsers']).valueSeq().filter(hu => {
      return hu.get('horseID') === horseID && hu.get('userID') === userID
    })
    if (filterHorseUser.count() !== 1) {
      throw Error('Could not find horseUser')
    }
    let theHorseUser = filterHorseUser.get(0)
    theHorseUser = theHorseUser.set('deleted', true)
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveHorse(theHorseUser.toJS())
    await dispatch(horseUserUpdated(theHorseUser.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))

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
      dispatch(startListeningFCM())
      dispatch(syncDBPull('all'))
    } else {
      dispatch(switchRoot(SIGNUP_LOGIN))
    }
  }
}

function loadLocalData () {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
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
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const userAPI = new UserAPI(jwt)
    try {
      await userAPI.changePassword(password)
      dispatch(switchRoot(FEED))
    } catch (e) {
      logError(e)
    }
  }
}

export function searchForFriends (phrase) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
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
    const userID = getState().getIn(['main', 'localState', 'userID'])
    Sentry.setUserContext({
      userID,
    });
  }
}

export function saveRide (rideData) {
  return async (dispatch) => {
    const pouchCouch = new PouchCouch()
    const doc = await pouchCouch.saveRide(rideData.toJS())
    dispatch(rideSaved(rideData.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('rides'))
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

    BackgroundGeolocation.on('location', (location) => {
      const lastLocation = getState().getIn(['main', 'localState', 'lastLocation'])
      let parsedLocation = Map({
        accuracy: location.accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        provider: location.provider,
        timestamp: location.time,
      })

      let replaced = false
      if (lastLocation) {
        let distance = haversine(
          lastLocation.get('latitude'),
          lastLocation.get('longitude'),
          location.latitude,
          location.longitude
        )
        let lastAccuracy = lastLocation.get('accuracy')
        if (distance < 0.02 && location.accuracy < lastAccuracy) {
          dispatch(replaceLastLocation(parsedLocation))
          replaced = true
        }
      }
      if (!replaced) {
        dispatch(newLocation(parsedLocation))
      }
    })

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
      Sentry.captureException(new Error(JSON.stringify(error)))
    });

    BackgroundGeolocation.start()
  }
}

function configureBackgroundGeolocation () {
  return async () => {
    logInfo('configuring geolocation')
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      locationProvider: BackgroundGeolocation.RAW_PROVIDER,
      distanceFilter: 1,
      maxLocations: 10,
      interval: 3000,
      notificationTitle: 'You\'re out on a ride.',
      notificationText: 'Tap here to see your progress.',
    });
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
      onNotification: (notification) => {
        alert('clicked')
      }
    })
    firebase.messaging().onTokenRefresh((m) => {
      logInfo('token refresh handler')
      logInfo(m)
    })
    firebase.messaging().onMessage(async (m) => {
      const userID = m._data.userID
      const distance = parseFloat(m._data.distance)
      const user = getState().getIn(['main', 'users']).get(userID)
      const message = `${user.get('firstName')} went for a ${distance.toFixed(1)} mile ride!`
      await dispatch(syncDBPull('rides'))
      PushNotification.localNotification({
        message: message,
      })
    })
    firebase.notifications().onNotificationOpened((m) => {
      logInfo('notification opened')
      logInfo(m)
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
    await firebase.iid().deleteToken('373350399276', 'GCM')
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
      dispatch(getFCMToken())
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
      dispatch(getFCMToken())
    } catch (e) {
      if (e instanceof BadRequestError) {
        dispatch(errorOccurred(e.message))
      }
    }
  }
}

export function syncDBPull (db) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const userID = getState().getIn(['main', 'localState', 'userID'])
    const follows = getState().getIn(['main', 'follows'])
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
    await pouchCouch.localReplicateDB(db, following, followers)
    await dispatch(loadLocalData())
    dispatch(syncComplete())
  }
}

export function toggleRideCarrot (rideID) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const currentUserID = getState().getIn(['main', 'localState', 'userID'])
    let existing = getState().getIn(['main', 'rideCarrots']).valueSeq().filter((c) => {
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

export function tryToLoadLocalState () {
  return async (dispatch) => {
    const localState = await LocalStorage.loadLocalState()
    if (localState) {
      dispatch(loadLocalState(localState))
    } else {
      logInfo('no cached local state found')
    }
  }
}

export function updateHorse (horseDetails) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveHorse(horseDetails.toJS())
    dispatch(horseSaved(horseDetails.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('horses'))
  }
}

export function updateRide (rideDetails) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
    const pouchCouch = new PouchCouch(jwt)
    const doc = await pouchCouch.saveRide(rideDetails.toJS())
    dispatch(rideSaved(rideDetails.set('_rev', doc.rev)))
    dispatch(needsRemotePersist('rides'))
  }
}

export function updateUser (userDetails) {
  return async (dispatch, getState) => {
    const jwt = getState().getIn(['main', 'localState', 'jwt'])
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


