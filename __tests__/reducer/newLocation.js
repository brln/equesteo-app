import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer from '../../reducer'
import { newLocation }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('NEW_LOCATION', () => {
  it('replaces last location if no current ride', () => {
    const initialState = Map({
      localState: Map({
        currentRide: null,
        lastLocation: null,
        refiningLocation: null,
        lastElevation: null
      }),
    })
    const location = Map({'some new': 'location'})
    const elevation = Map({'some new': 'elevation'})
    const expectedNewState = Map({
      localState: Map({
        currentRide: null,
        lastLocation: location,
        refiningLocation: location,
        lastElevation: elevation
      })
    })

    const action = newLocation(location, elevation)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

  it('saves the location and elevation if there is a current ride', () => {
    const startTime = unixTimeNow()
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List(),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastElevation: null,
        lastLocation: null,
        refiningLocation: null,
      })
    })
    let latitude = 45.21323
    let longitude = 27.28923
    let elevationPoint = 5280
    let location = Map({
      accuracy: 5,
      latitude: latitude,
      longitude: longitude,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    let elevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation: elevationPoint,
    })
    let expectedNewState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([location]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastLocation: location,
        refiningLocation: location,
        lastElevation: elevation,
      })
    })
    expectedNewState = expectedNewState.setIn(
      ['localState', 'currentRideElevations', 'elevations', latitude, longitude],
      elevationPoint
    )

    const action = newLocation(location, elevation)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

  it('adds the elevation and distance if there\'s already a point', () => {
    const startTime = unixTimeNow()
    const firstPoint = Map({
      accuracy: 5,
      latitude: 45.2200,
      longitude: 27.2900,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const firstElevation = Map({
      latitude: 45.2200,
      longitude: 27.2900,
      elevation: 1000
    })
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([firstPoint]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastElevation: firstElevation,
        lastLocation: firstPoint,
        refiningLocation: firstPoint,
      })
    })
    let latitude = 45.21323
    let longitude = 27.28923
    let elevationPoint = 5280
    let location = Map({
      accuracy: 5,
      latitude: latitude,
      longitude: longitude,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    let elevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation: elevationPoint,
    })
    let expectedNewState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([firstPoint, location]),
          distance: 0.46929,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 4280,
          elevations: Map()
        }),
        lastLocation: location,
        refiningLocation: location,
        lastElevation: elevation,
      })
    })
    expectedNewState = expectedNewState.setIn(
      ['localState', 'currentRideElevations', 'elevations', latitude, longitude],
      elevationPoint
    )

    const action = newLocation(location, elevation)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

  it('saves the elevation but doesn\'t change anything if it\'s paused', () => {
    const startTime = unixTimeNow()
    const firstPoint = Map({
      accuracy: 5,
      latitude: 45.220011,
      longitude: 27.290012,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const firstElevation = Map({
      latitude: 45.220023,
      longitude: 27.290034,
      elevation: 1000
    })
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([firstPoint]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastElevation: firstElevation,
        lastLocation: firstPoint,
        locationTrackingPaused: true,
        pausedCachedCoordinates: List(),
        refiningLocation: firstPoint,
      })
    })
    let latitude = 45.21323
    let longitude = 27.28923
    let elevationPoint = 5280
    let location = Map({
      accuracy: 5,
      latitude: latitude,
      longitude: longitude,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    let elevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation: elevationPoint,
    })
    let expectedNewState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([firstPoint]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastLocation: location,
        locationTrackingPaused: true,
        refiningLocation: location,
        lastElevation: elevation,
        pausedCachedCoordinates: List([location])
      })
    })
    expectedNewState = expectedNewState.setIn(
      ['localState', 'currentRideElevations', 'elevations', latitude, longitude],
      elevationPoint
    )

    const action = newLocation(location, elevation)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

})
