import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer, { initialState } from '../../reducer'
import { replaceLastLocation }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('REPLACE_LAST_LOCATION', () => {
  it('should replace last location and elevation', () => {
    const initialState = Map({
      localState: Map({
        lastLocation: 'some old location',
        lastElevation: 'some old elevation'
      }),
    })
    const newLocation = Map({'some new': 'location'})
    const newElevation = Map({'some new': 'elevation'})
    const newState = Map({
      localState: Map({
        lastLocation: newLocation,
        lastElevation: newElevation,
      })
    })

    expect(AppReducer(initialState, replaceLastLocation(newLocation, newElevation))).toEqual(newState)
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
      ['localState', 'currentRideElevations', 'elevations', latitude.toFixed(4), longitude.toFixed(4)],
      elevationPoint
    )

    expect(AppReducer(initialState, replaceLastLocation(location, elevation))).toEqual(expectedNewState)
  })


  it('should replace the last coordinate if there\'s more than one coordinate in the new ride', () => {
    const startTime = unixTimeNow()
    const firstPoint = Map({
      accuracy: 5,
      latitude: 45.220019,
      longitude: 27.290034,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const secondPoint = Map({
      accuracy: 5,
      latitude: 45.230098,
      longitude: 27.300023,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    const lastElevation = Map({
      latitude: 45.230014,
      longitude: 27.300012,
      elevation: 2000
    })
    const initialElevation = Map({
      elevationGain: 1000,
      elevations: Map({
        '45.2200': Map({'27.2900': 1000}),
        '45.2300': Map({'27.3000': 2000})
      })
    })

    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([Map({some: 'point'}), firstPoint, secondPoint]),
          distance: 25,
          startTime: startTime
        }),
        currentRideElevations: initialElevation,
        lastElevation,
        lastLocation: firstPoint,
        refiningLocation: firstPoint,
      })
    })
    let latitude = 45.21323
    let longitude = 27.28923
    let elevationPoint = 4000
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
          rideCoordinates: List([Map({some: 'point'}), firstPoint, location]),
          distance: 25.470733,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 4000,
          elevations: Map({
            '45.2200': Map({'27.2900': 1000}),
            '45.2300': Map({'27.3000': 2000}),
            '45.2132': Map({'27.2892': elevationPoint})
          })
        }),
        lastLocation: location,
        refiningLocation: firstPoint,
        lastElevation: elevation,
      })
    })

    expect(AppReducer(initialState, replaceLastLocation(location, elevation))).toEqual(expectedNewState)
    expect(
      AppReducer(
        initialState,
        replaceLastLocation(location, elevation)
      ).getIn(
        ['localState', 'currentRide', 'rideCoordinates']
      ).count()
    ).toEqual(3)
  })
})