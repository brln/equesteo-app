import { fromJS, List, Map } from 'immutable'
import { green, warning, danger } from './colors'
import {
  CLEAR_FEED_MESSAGE,
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
  HORSE_USER_UPDATED,
  HORSE_SAVED,
  LOAD_LOCAL_STATE,
  LOCAL_DATA_LOADED,
  MARK_PHOTO_ENQUEUED,
  MERGE_PAUSED_LOCATIONS,
  NEEDS_REMOTE_PERSIST,
  NEW_APP_STATE,
  NEW_LOCATION,
  NEW_NETWORK_STATE,
  PAUSE_LOCATION_TRACKING,
  POP_SHOW_RIDE_SHOWN,
  RECEIVE_JWT,
  REMOTE_PERSIST_COMPLETE,
  REMOTE_PERSIST_ERROR,
  REMOTE_PERSIST_STARTED,
  REMOVE_RIDE_FROM_STATE,
  REPLACE_LAST_LOCATION,
  RESUME_LOCATION_TRACKING,
  RIDE_COMMENT_CREATED,
  RIDE_CARROT_CREATED,
  RIDE_CARROT_SAVED,
  RIDE_CREATED,
  RIDE_SAVED,
  SAVE_USER_ID,
  SET_ACTIVE_COMPONENT,
  START_RIDE,
  TOGGLE_AWAITING_PW_CHANGE,
  TOGGLE_DOING_INITIAL_LOAD,
  SYNC_COMPLETE,
  UNPAUSE_LOCATION_TRACKING,
  USER_SEARCH_RETURNED,
  USER_UPDATED,
} from './constants'
import {
  appStates,
  goodConnection,
  haversine
} from './helpers'
import { FEED, SIGNUP_LOGIN } from './screens'

export const initialState = Map({
  localState: Map({
    activeComponent: null,
    appState: appStates.active,
    awaitingPWChange: false,
    clearStateAfterPersist: false,
    currentScreen: FEED,
    currentRide: null,
    doingInitialLoad: false,
    error: null,
    feedMessage: null,
    goodConnection: false,
    jwt: null,
    lastLocation: null,
    locationTrackingPaused: false,
    needsRemotePersist: Map({
      horses: false,
      rides: false,
      users: false,
    }),
    pausedCachedCoordinates: List(),
    photoQueue: Map(),
    popShowRide: null,
    remotePersistActive: false,
    root: SIGNUP_LOGIN,
    userID: null,
    userSearchResults: List(),
  }),
  horses: Map(),
  horseUsers: Map(),
  follows: Map(),
  lastFullSync: null,
  rides: Map(),
  rideCarrots: Map(),
  rideComments: Map(),
  users: Map(),
})

export default function AppReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_FEED_MESSAGE:
      return state.setIn(['localState', 'feedMessage'], null)
    case CLEAR_LAST_LOCATION:
      return state.setIn(['localState', 'lastLocation'], null)
    case CLEAR_PAUSED_LOCATIONS:
      return state.setIn(['localState', 'pausedCachedCoordinates'], List())
    case CLEAR_SEARCH:
      return state.setIn(['localState', 'userSearchResults'], List())
    case CLEAR_STATE:
      return initialState.setIn(
        ['localState', 'goodConnection'],
        state.getIn('localState', 'goodConnection')
      )
    case CLEAR_STATE_AFTER_PERSIST:
      return state.setIn(['localState', 'clearStateAfterPersist'], true)
    case DEQUEUE_PHOTO:
      return state.deleteIn(['localState', 'photoQueue', action.photoID])
    case DISCARD_RIDE:
      return state.setIn(['localState', 'currentRide'], null)
    case DISMISS_ERROR:
      return state.setIn(['localState', 'error'], null)
    case ENQUEUE_PHOTO:
      return state.setIn(['localState', 'photoQueue', action.queueItem.get('photoID')], action.queueItem)
    case ERROR_OCCURRED:
      return state.setIn(['localState', 'error'], action.message)
    case FOLLOW_UPDATED:
      return state.setIn(['follows', action.follow.get('_id')], action.follow)
    case HORSE_CREATED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case HORSE_SAVED:
      return state.set('horses', state.get('horses').set(action.horse.get('_id'), action.horse))
    case HORSE_USER_UPDATED:
      return state.set('horseUsers', state.get('horseUsers').set(action.horseUser.get('_id'), action.horseUser))
    case PAUSE_LOCATION_TRACKING:
      return state.setIn(['localState', 'locationTrackingPaused'], true)
    case POP_SHOW_RIDE_SHOWN:
      return state.setIn(['localState', 'popShowRide'], null)
    case LOAD_LOCAL_STATE:
      return state.set('localState', action.localState).setIn(['localState', 'feedMessage'], null)
    case LOCAL_DATA_LOADED:
      const allUsers = action.localData.users.reduce((accum, user) => {
        accum[user._id] = fromJS(user)
        return accum
      }, {})

      const allFollows = action.localData.follows.reduce((accum, follow) => {
        accum[follow._id] = fromJS(follow)
        return accum
      }, {})

      const allHorses = action.localData.horses.reduce((accum, horse) => {
        accum[horse._id] = fromJS(horse)
        return accum
      }, {})

      const allHorseUsers = action.localData.horseUsers.reduce((accum, horseUser) => {
        accum[horseUser._id] = fromJS(horseUser)
        return accum
      }, {})

      const allRides = action.localData.rides.reduce((accum, ride) => {
        accum[ride._id] = fromJS(ride)
        return accum
      }, {})

      const allCarrots = action.localData.rideCarrots.reduce((accum, carrot) => {
        accum[carrot._id] = fromJS(carrot)
        return accum
      }, {})

      const allComments = action.localData.rideComments.reduce((accum, comment) => {
        accum[comment._id] = fromJS(comment)
        return accum
      }, {})

      return state.merge(Map({
        users: Map(allUsers),
        follows: Map(allFollows),
        rides: Map(allRides),
        rideCarrots: Map(allCarrots),
        rideComments: Map(allComments),
        horses: Map(allHorses),
        horseUsers: Map(allHorseUsers)
      }))
    case MARK_PHOTO_ENQUEUED:
      return state.setIn(['localState', 'photoQueue', action.queueItemID, 'queueID'], action.queueID)
    case MERGE_PAUSED_LOCATIONS:
      const rideCoordinates = state.getIn(
        ['localState', 'currentRide', 'rideCoordinates']
      )
      const pausedCoordinates = state.getIn(
        ['localState', 'pausedCachedCoordinates']
      )
      const merged = rideCoordinates.concat(pausedCoordinates)
      return state.setIn(
        ['localState', 'currentRide', 'rideCoordinates'],
        merged
      ).setIn(
        ['localState', 'pausedCachedCoordinates'],
        List()
      )
    case NEEDS_REMOTE_PERSIST:
      return state.setIn(
        ['localState', 'needsRemotePersist', action.database],
        true
      ).setIn(
        ['localState', 'feedMessage'],
        Map({
          message: 'Data Needs to Upload',
          color: warning,
          timeout: false
        })
      )
    case NEW_APP_STATE:
      return state.setIn(['localState', 'appState'], action.newState)
    case NEW_LOCATION:
      const newState = state.setIn(['localState', 'lastLocation'], action.location)
      const currentRide = state.getIn(['localState', 'currentRide'])
      const currentlyPaused = state.getIn(['localState', 'locationTrackingPaused'])
      if (currentRide && !currentlyPaused) {
        let newDistance = 0
        const lastLocation = state.getIn(['localState', 'lastLocation'])
        if (lastLocation) {
          newDistance = haversine(
            lastLocation.get('latitude'),
            lastLocation.get('longitude'),
            action.location.get('latitude'),
            action.location.get('longitude')
          )
        }
        const rideCoordinates = state.getIn(
          ['localState', 'currentRide', 'rideCoordinates']
        ).push(
          action.location
        ).sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        const totalDistance = currentRide.get('distance') + newDistance
        const newCurrentRide = currentRide.merge(Map({rideCoordinates, distance: totalDistance}))
        return newState.setIn(['localState', 'currentRide'], newCurrentRide)
      } else if (currentRide && currentlyPaused) {
        const pausedCoordinates = state.getIn(
          ['localState', 'pausedCachedCoordinates']
        ).push(
          action.location
        ).sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        return newState.setIn(
          ['localState', 'pausedCachedCoordinates'],
          pausedCoordinates
        )
      } else {
        return newState
      }
    case NEW_NETWORK_STATE:
      return state.setIn(
        ['localState', 'goodConnection'],
        goodConnection(
          action.connectionType,
          action.effectiveConnectionType
        )
      )
    case RECEIVE_JWT:
      return state.setIn(['localState', 'jwt'], action.token)
    case REMOTE_PERSIST_COMPLETE:
      let dbSwitched = state.setIn(
        ['localState', 'needsRemotePersist', action.database],
        false
      )
      const allDone = dbSwitched.getIn(
        ['localState', 'needsRemotePersist']
      ).valueSeq().filter(x => x).count() === 0
      if (allDone) {
        dbSwitched = dbSwitched.setIn(
          ['localState', 'feedMessage'],
          Map({
            message: 'All Data Uploaded',
            color: green,
            timeout: 3000
          })
        ).setIn(
            ['localState', 'remotePersistActive'],
            false
          )
        }
      return dbSwitched
    case REMOTE_PERSIST_ERROR:
      return state.setIn(
        ['localState', 'feedMessage'],
        Map({
          message: 'Can\'t Upload Data',
          color: danger,
          timeout: false
        })
      ).setIn(
        ['localState', 'remotePersistActive'],
        false
      )
    case REMOTE_PERSIST_STARTED:
      return state.setIn(
        ['localState', 'feedMessage'],
        Map({
          message: 'Data Uploading',
          color: warning,
          timeout: false
        })
      ).setIn(
        ['localState', 'remotePersistActive'],
        true
      )
    case REMOVE_RIDE_FROM_STATE:
      return state.remove(action.rideID)
    case REPLACE_LAST_LOCATION:
      const oldLastLocation = state.getIn(['localState', 'lastLocation'])
      let replacedLastLocation = state.setIn(['localState', 'lastLocation'], action.newLocation)
      const currentRide1 = state.getIn(['localState', 'currentRide'])
      if (currentRide1) {
        const rideCoords = currentRide1.get('rideCoordinates')
        if (rideCoords.count() === 1) {
          return replacedLastLocation.setIn(
            ['localState', 'currentRide', 'rideCoordinates'],
            List().push(action.newLocation)
          )
        } else if (rideCoords.count() > 1) {
          const lastCoord = rideCoords.get(-2)
          const oldDistance = haversine(
            oldLastLocation.get('latitude'),
            oldLastLocation.get('longitude'),
            lastCoord.get('latitude'),
            lastCoord.get('longitude')
          )
          const newDistance = haversine(
            lastCoord.get('latitude'),
            lastCoord.get('longitude'),
            action.newLocation.get('latitude'),
            action.newLocation.get('longitude')
          )
          const newRideCoordinates = replacedLastLocation.getIn(
            ['localState', 'currentRide', 'rideCoordinates']
          ).pop().push(
            action.newLocation
          ).sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
          })

          const totalDistance = currentRide1.get('distance')
            - oldDistance
            + newDistance
          return replacedLastLocation.setIn(
            ['localState', 'currentRide', 'distance'],
            totalDistance
          ).setIn(
            ['localState', 'currentRide', 'rideCoordinates'],
            newRideCoordinates
          )
        }
      }
      return replacedLastLocation
    case RESUME_LOCATION_TRACKING:
      return state.setIn(['localState', 'locationTrackingPaused'], false)
    case RIDE_CARROT_CREATED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_CARROT_SAVED:
      return state.setIn(['rideCarrots', action.carrotData.get('_id')], action.carrotData)
    case RIDE_COMMENT_CREATED:
      return state.setIn(['rideComments', action.rideComment.get('_id')], action.rideComment)
    case RIDE_CREATED:
      return state.setIn(
        ['rides', action.ride.get('_id')], action.ride
      ).setIn(
        ['localState', 'popShowRide'], action.ride.get('_id')
      ).setIn(
        ['localState', 'currentRide'], null
      )
    case RIDE_SAVED:
      return state.setIn(['rides', action.ride.get('_id')], action.ride)
    case SAVE_USER_ID:
      return state.setIn(
        ['localState', 'userID'], action.userID
      )
    case SET_ACTIVE_COMPONENT:
      return state.setIn(
        ['localState', 'activeComponent'], action.componentID
      )
    case START_RIDE:
      return state.setIn(['localState', 'currentRide'], action.currentRide)
    case SYNC_COMPLETE:
      return state.setIn(['localState', 'lastFullSync'], new Date())
    case TOGGLE_AWAITING_PW_CHANGE:
      return state.setIn(
        ['localState', 'awaitingPWChange'],
        !state.getIn(['localState', 'awaitingPWChange'])
      )
    case TOGGLE_DOING_INITIAL_LOAD:
      return state.setIn(
        ['localState', 'doingInitialLoad'],
        !state.getIn(['localState', 'doingInitialLoad'])
      )
    case UNPAUSE_LOCATION_TRACKING:
      return state.setIn(['localState', 'locationTrackingPaused'], false)
    case USER_UPDATED:
      return state.setIn(['users', action.userData.get('_id')], action.userData)
    case USER_SEARCH_RETURNED:
      return state.setIn(['localState', 'userSearchResults'], action.userSearchResults)
    default:
      return state
  }
}