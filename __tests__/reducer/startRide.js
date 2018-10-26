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
    const firstCoord = 'ducks'
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
        rideCoordinates: List([firstCoord]),
        distance: 0,
        startTime: startTime,
        pausedTime: 0,
        lastPauseStart: null,
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
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
