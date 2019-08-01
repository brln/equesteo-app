import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { fromJS, Map } from 'immutable'

import {
  CREATE_RIDE,
  DISMISS_ERROR,
  GPS_SIGNAL_LOST,
  NEW_LOCATION,
  RIDE_ELEVATIONS_LOADED,
  RIDE_COORDINATES_LOADED,
  RIDE_UPDATED,
  SET_GPS_COORDINATES_RECEIVED,
  REPLACE_LAST_LOCATION,
  SET_AWAITING_PW_CHANGE,
  SAVE_USER_ID,
  SET_DOING_INITIAL_LOAD,
} from "../../constants"
import * as helpers from '../../helpers'
import functional from '../../actions/functional'

const mockStore = configureStore([thunk])

describe('duplicateRide', () => {
  it('duplicates the ride', () => {
    const rideID = 'someRideID'
    const rideCoordinates = fromJS({
      _id: 'rideCoords1'
    })
    const rideElevations = fromJS({
      _id: 'rideElevations1'
    })
    const ride = fromJS({_id: rideID})

    const store = mockStore(fromJS({
      localState: {
        goodConnection: true,
        photoQueue: [],
      },
      pouchRecords: {
        rides: {
          someRideID: ride
        },
        selectedRideCoordinates: rideCoordinates,
        selectedRideElevations: rideElevations,
      }
    }))

    const userID = 'userid1'
    functional.doSync = jest.fn(() => { return () => { Promise.resolve() } })

    helpers.rideIDGenerator = jest.fn(() => rideID)
    return store.dispatch(functional.duplicateRide(userID, ride, rideElevations, rideCoordinates)).then(() => {
      const actions = store.getActions()
      expect(actions.map(a => a.type)).toEqual([
        CREATE_RIDE,
        RIDE_ELEVATIONS_LOADED,
        RIDE_COORDINATES_LOADED,
        RIDE_UPDATED,
      ])
    })
  })
})

describe('onGPSLocation', () => {
  it ('records the first real location', () => {
    const store = mockStore(fromJS({
      localState: {
        gpsSignalLost: false,
        hoofTracksRunning: false,
        gpsCoordinatesReceived: 3,
      },
      currentRide: {
        lastLocation: null,
        currentRide: {
          distance: 0
        },
        refiningLocation: null
      }
    }))
    const latitude = 1.289328932
    const longitude = 1.3798327932
    const altitude = 328.4
    const accuracy = 8.3
    const time = 8932897237
    const speed = 5.4
    const location = {
      latitude, longitude, altitude, accuracy, time, speed
    }

    store.dispatch(functional.onGPSLocation(location))

    const expectedLocation = {
      elevation: Map({
        latitude,
        longitude,
        elevation: altitude,
      }),
      location: Map({
        accuracy,
        latitude,
        longitude,
        timestamp: time,
        speed,
      }),
      type: NEW_LOCATION
    }
    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      SET_GPS_COORDINATES_RECEIVED,
      GPS_SIGNAL_LOST,
      NEW_LOCATION
    ])
    expect(actions[0].value).toBe(4)
    expect(actions[1].value).toBe(false)
    expect(actions[2]).toEqual(expectedLocation)
  })

  it ('doesn\'t record locations that come in rapidly', () => {
    const lastSavedTime = 1
    const store = mockStore(fromJS({
      localState: {
        gpsSignalLost: false,
        hoofTracksRunning: false,
        gpsCoordinatesReceived: 3,
      },
      currentRide: {
        lastLocation: {
          accuracy: 1,
          latitude: 1,
          longitude: 1,
          timestamp: lastSavedTime,
          speed: 1,
        },
        currentRide: {
          distance: 1
        },
        refiningLocation: null
      }
    }))
    const latitude = 1
    const longitude = 1
    const altitude = 1
    const accuracy = 1
    const time = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      latitude, longitude, altitude, accuracy, time, speed
    }

    store.dispatch(functional.onGPSLocation(location))

    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      SET_GPS_COORDINATES_RECEIVED,
      GPS_SIGNAL_LOST
    ])
    expect(actions[1].value).toBe(false)
  })

  it ('throws away locations with bad accuracy', () => {
    const lastSavedTime = 1
    const store = mockStore(fromJS({
      localState: {
        gpsSignalLost: false,
        hoofTracksRunning: false,
        gpsCoordinatesReceived: 34
      },
      currentRide: {
        lastLocation: null,
        currentRide: {
          distance: 0
        },
        refiningLocation: null
      }
    }))
    const latitude = 1
    const longitude = 1
    const altitude = 1
    const accuracy = 26
    const time = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      latitude, longitude, altitude, accuracy, time, speed
    }

    store.dispatch(functional.onGPSLocation(location))

    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      SET_GPS_COORDINATES_RECEIVED,
    ])
  })

  it ('throws away the first 3 locations', () => {
    const lastSavedTime = 1
    const store = mockStore(fromJS({
      localState: {
        gpsSignalLost: false,
        hoofTracksRunning: false,
        gpsCoordinatesReceived: 2
      },
      currentRide: {
        lastLocation: null,
        currentRide: {
          distance: 0
        },
        refiningLocation: null
      }
    }))
    const latitude = 1
    const longitude = 1
    const altitude = 1
    const accuracy = 1
    const time = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      latitude, longitude, altitude, accuracy, time, speed
    }

    store.dispatch(functional.onGPSLocation(location))

    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      SET_GPS_COORDINATES_RECEIVED,
    ])
  })

  it ('refines your location if you\'re not moving', () => {
    const lastLocation = fromJS({
      accuracy: 5,
      latitude: 37.32470957,
      longitude: -122.02029078,
      timestamp: 1564588138349.4282,
      speed: 3.27,
    })

    const store = mockStore(fromJS({
      localState: {
        gpsSignalLost: false,
        hoofTracksRunning: false,
        gpsCoordinatesReceived: 3,
      },
      currentRide: {
        lastLocation,
        refiningLocation: lastLocation,
        currentRide: {
          distance: 0
        },
      }
    }))
    const latitude = 37.32470957
    const longitude = -122.02029078
    const altitude = 328.4
    const accuracy = 5
    const time = 1564588145349.4282
    const speed = 5.4
    const location = {
      latitude, longitude, altitude, accuracy, time, speed
    }

    store.dispatch(functional.onGPSLocation(location))

    const expectedLocation = {
      newElevation: Map({
        latitude,
        longitude,
        elevation: altitude,
        accuracy: 4.7885763621517965,
      }),
      newLocation: Map({
        accuracy: 4.7885763621517965,
        latitude,
        longitude,
        timestamp: time,
        speed,
      }),
      type: REPLACE_LAST_LOCATION
    }
    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      SET_GPS_COORDINATES_RECEIVED,
      GPS_SIGNAL_LOST,
      REPLACE_LAST_LOCATION,
    ])
    expect(actions[0].value).toBe(4)
    expect(actions[1].value).toBe(false)
    expect(actions[2]).toEqual(expectedLocation)
  })
})

describe('loginAndSync', () => {
  it ('logs in and syncs', () => {
    const store = mockStore(fromJS({}))
    const loginFunc = () => {
      return Promise.resolve({
        id: 'someID',
        following: [],
        followers: [],
      })
    }

    functional.startListeningFCMTokenRefresh = jest.fn(() => { return () => {}  })
    functional.setDistributionOnServer = jest.fn(() => { return () => {}  })
    functional.doSync = jest.fn(() => { return () => Promise.resolve()  })

    return store.dispatch(functional.loginAndSync(loginFunc, [])).then(() => {
      const actions = store.getActions()
      expect(actions.map(a => a.type)).toEqual([
        DISMISS_ERROR,
        SET_AWAITING_PW_CHANGE,
        SAVE_USER_ID,
        SET_DOING_INITIAL_LOAD,
      ])
    })
  })
})
