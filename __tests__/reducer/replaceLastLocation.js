import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer, { initialState } from '../../reducer'
import { replaceLastLocation }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('REPLACE_LAST_LOCATION', () => {
  it('should replace last location', () => {
    const initialState = Map({
      localState: Map({
        lastLocation: 'some old location',
      }),
    })
    const newLocation = Map({'some new': 'location'})
    const expectedNewState = initialState.setIn(['localState', 'lastLocation'], newLocation)
    expect(AppReducer(initialState, replaceLastLocation(newLocation))).toEqual(expectedNewState)
  })


  it('should replace the only coordinate if there\'s only one coordinate in the new ride', () => {
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
          elevations: Map(firstElevation)
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
          rideCoordinates: List([location]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastLocation: location,
        refiningLocation: firstPoint,
        lastElevation: elevation,
      })
    })
    expectedNewState = expectedNewState.setIn(
      ['localState', 'currentRideElevations', 'elevations', latitude, longitude],
      elevationPoint
    )

    expect(AppReducer(initialState, replaceLastLocation(location, elevation))).toEqual(expectedNewState)
  })


  it('should replace the last coordinate if there\'s more than one coordinate in the new ride', () => {
    const startTime = unixTimeNow()
    const firstPoint = Map({
      accuracy: 5,
      latitude: 45.2200,
      longitude: 27.2900,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const secondPoint = Map({
      accuracy: 5,
      latitude: 45.2300,
      longitude: 27.3000,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const firstElevation = Map({
      latitude: 45.2200,
      longitude: 27.2900,
      elevation: 1000
    })
    const secondElevation = Map({
      latitude: 45.2300,
      longitude: 27.3000,
      elevation: 1005
    })
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([Map({some: 'point'}), firstPoint, secondPoint]),
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
          rideCoordinates: List([Map({some: 'point'}), Map({someOther: 'point'}), location]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        }),
        lastLocation: location,
        refiningLocation: firstPoint,
        lastElevation: elevation,
      })
    })

    expect(AppReducer(initialState, replaceLastLocation(newLocation))).toEqual(expectedNewState)
    expect(
      AppReducer(
        initialState,
        replaceLastLocation(newLocation)
      ).getIn(
        ['localState', 'currentRide', 'rideCoordinates']
      ).count()
    ).toEqual(3)
  })
})