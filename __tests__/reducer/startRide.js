import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import CurrentRideReducer from '../../reducers/CurrentRide'
import { startRide }  from '../../actions'
import { toElevationKey, unixTimeNow } from '../../helpers'

describe('START_RIDE', () => {
  it('starts the ride', () => {
    const initialState = Map({
      currentRide: null,
    })
    const firstCoord = Map({latitude: 1, longitude: 12, accuracy: 123, timestamp: 4})
    const latitude = 12
    const longitude = 13
    const elevation = 134
    const firstElevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation
    })
    const startTime = unixTimeNow()
    let expectedNewState = Map({
      currentRide: Map({
        startTime: startTime,
        pausedTime: 0,
        lastPauseStart: null,
        distance: 0,
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([List([1, 12, 4, 123])]),
      })

    })
    expectedNewState = expectedNewState.setIn(
      ['currentRideElevations', 'elevations', toElevationKey(latitude), toElevationKey(longitude)],
      elevation
    )

    const action = startRide(firstCoord, firstElevation, startTime)

    expect(CurrentRideReducer(initialState, action)).toEqual(expectedNewState)
  })

})
