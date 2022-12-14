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
  SET_DOING_INITIAL_LOAD, LOG_FUNCTIONAL_ACTION,
} from "../../constants"
import * as helpers from '../../helpers'
import functional from '../../actions/functional'
import EnvVars from '../../dotEnv'
import {unixTimeFromStamp} from "../../helpers"

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
      console.log(actions)
      expect(actions.map(a => a.type)).toEqual([
        LOG_FUNCTIONAL_ACTION,
        CREATE_RIDE,
        LOG_FUNCTIONAL_ACTION,
        RIDE_ELEVATIONS_LOADED,
        RIDE_COORDINATES_LOADED,
        RIDE_UPDATED,
      ])
      expect(actions[0].name).toBe('duplicateRide')
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
    const timestamp = 8932897237
    const speed = 5.4
    const location = {
      coords: {latitude, longitude, altitude, accuracy, speed},
      timestamp,
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
        timestamp,
        speed,
      }),
      type: NEW_LOCATION,
      logData: ["location"]

    }
    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      NEW_LOCATION
    ])
    expect(actions[0]).toEqual(expectedLocation)
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
    const timestamp = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      coords: {latitude, longitude, altitude, accuracy, speed},
      timestamp,
    }

    store.dispatch(functional.onGPSLocation(location))

    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([])
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
    const timestamp = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      coords: {latitude, longitude, altitude, accuracy, speed},
      timestamp,
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
    const timestamp = lastSavedTime + 3000
    const speed = 5.4
    const location = {
      coords: {latitude, longitude, altitude, accuracy, speed},
      timestamp,
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
    const timestamp = new Date(1564588145349.4282).toISOString()
    const speed = 5.4
    const location = {
      coords: {latitude, longitude, altitude, accuracy, speed},
      timestamp,
    }

    store.dispatch(functional.onGPSLocation(location))

    const expectedLocation = {
      newElevation: Map({
        latitude,
        longitude,
        elevation: altitude,
        accuracy: 4.788565330906798,
      }),
      newLocation: Map({
        accuracy: 4.788565330906798,
        latitude,
        longitude,
        timestamp: unixTimeFromStamp(timestamp),
        speed,
      }),
      type: REPLACE_LAST_LOCATION,
      logData: ["newLocation"]
    }
    const actions = store.getActions()
    expect(actions.map(a => a.type)).toEqual([
      REPLACE_LAST_LOCATION,
    ])
    expect(actions[0]).toEqual(expectedLocation)
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
        LOG_FUNCTIONAL_ACTION,
        DISMISS_ERROR,
        SET_AWAITING_PW_CHANGE,
        SAVE_USER_ID,
        SET_DOING_INITIAL_LOAD,
        LOG_FUNCTIONAL_ACTION
      ])
      expect(actions[0].name).toBe('loginAndSync')
      expect(actions[5].name).toBe('removeForgotPWLinkListener')
    })
  })
})

describe('gpsLocationError', () => {
  it ('logs but ignores 1003 errors', () => {
    const store = mockStore(fromJS({}))
    EnvVars.ENV = 'test'
    const error = {"message":"The operation couldn???t be completed. (com.marianhello error 1003.)","code":1003}
    return store.dispatch(functional.gpsLocationError(error))
  })

  it ('captures 1000 errors', () => {
    const store = mockStore(fromJS({}))
    EnvVars.ENV = 'test'
    const error = {"message":"Yo you get permissions issues bro","code":1000}
    return store.dispatch(functional.gpsLocationError(error))
  })

  it ('captures other kinds of errors', () => {
    const store = mockStore(fromJS({}))
    EnvVars.ENV = 'test'
    const error = {"message":"I don't know what the text is for the other errors","code":1001}
    return store.dispatch(functional.gpsLocationError(error))
  })

  it ('deals with some weird shit', () => {
    const store = mockStore(fromJS({}))
    EnvVars.ENV = 'test'
    const error = {"message":"I don't know what the text is for the other errors","code":1001}
    error.recurse = error
    return store.dispatch(functional.gpsLocationError(error))
  })
})
