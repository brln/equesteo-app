import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import CurrentRideReducer from '../../reducers/CurrentRide'
import { newLocation }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('NEW_LOCATION', () => {
  it('replaces last location if no current ride', () => {
    const initialState = Map({
      currentRide: null,
      lastLocation: null,
      refiningLocation: null,
      lastElevation: null
    })
    const location = Map({latitude: 1, longitude: 1, accuracy: 1, timestamp: 1})
    const elevation = Map({'some new': 'elevation'})
    const expectedNewState = Map({
      currentRide: null,
      lastLocation: location,
      refiningLocation: location,
      lastElevation: elevation
    })

    const action = newLocation(location, elevation)

    expect(CurrentRideReducer(initialState, action)).toEqual(expectedNewState)
  })

  it('saves the location and elevation if there is a current ride', () => {
    const startTime = unixTimeNow()
    const initialState = Map({
      currentRide: Map({
        startTime: startTime,
        distance: 0,
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List(),
      }),
      lastElevation: null,
      lastLocation: null,
      refiningLocation: null,
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
      currentRide: Map({
        startTime: startTime,
        distance: 0,
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([List([latitude, longitude, 1, 5])]),
      }),
      lastLocation: location,
      refiningLocation: location,
      lastElevation: elevation,
    })
    expectedNewState = expectedNewState.setIn(
      ['currentRideElevations', 'elevations', latitude.toFixed(4), longitude.toFixed(4)],
      elevationPoint
    )

    const action = newLocation(location, elevation)

    expect(CurrentRideReducer(initialState, action)).toEqual(expectedNewState)
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
      currentRide: Map({
        startTime: startTime,
        distance: 0,
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map(Map({45.2200: Map({26.2900: 1000})}))
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([List([44.220000, 27.290000, 1, 5])]),
      }),
      lastElevation: firstElevation,
      lastLocation: firstPoint,
      refiningLocation: firstPoint,
    })
    let latitude = 45.21323998
    let longitude = 27.2892378923
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
      currentRide: Map({
        startTime: startTime,
        distance: 0.46857,
      }),
      currentRideElevations: Map({
        elevationGain: 4280,
        elevations: Map({45.2200: Map({26.2900: 1000}), 45.2132: Map({27.2892: 5280})})
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([
          List([44.220000, 27.290000, 1, 5]),
          List([Number(latitude.toFixed(6)), Number(longitude.toFixed(6)), 1, 5])]
        ),
      }),
      lastLocation: location,
      refiningLocation: location,
      lastElevation: elevation,
    })

    const action = newLocation(location, elevation)

    expect(CurrentRideReducer(initialState, action)).toEqual(expectedNewState)
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
      currentRide: Map({
        distance: 0,
        startTime: startTime
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      lastElevation: firstElevation,
      lastLocation: firstPoint,
      locationStashingActive: true,
      stashedCoordinates: List(),
      refiningLocation: firstPoint,
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
      currentRide: Map({
        distance: 0,
        startTime: startTime
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      lastLocation: location,
      locationStashingActive: true,
      refiningLocation: location,
      lastElevation: elevation,
      stashedCoordinates: List([List([
        45.213230, 27.289230, 1, 5
      ])])
    })
    expectedNewState = expectedNewState.setIn(
      ['currentRideElevations', 'elevations', latitude.toFixed(4), longitude.toFixed(4)],
      elevationPoint
    )

    const action = newLocation(location, elevation)

    expect(CurrentRideReducer(initialState, action)).toEqual(expectedNewState)
  })

})
