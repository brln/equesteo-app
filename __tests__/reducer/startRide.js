import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer from '../../reducer'
import { startRide }  from '../../actions'
import { toElevationKey, unixTimeNow } from '../../helpers'

describe('START_RIDE', () => {
  it('starts the ride', () => {
    const initialState = Map({
      localState: Map({
        currentRide: null,
      }),
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
      localState: Map({
        currentRide: Map({
          rideCoordinates: List([firstCoord]),
          distance: 0,
          startTime: startTime
        }),
        currentRideElevations: Map({
          elevationGain: 0,
          elevations: Map()
        })
      })
    })
    expectedNewState = expectedNewState.setIn(
      ['localState', 'currentRideElevations', 'elevations', toElevationKey(latitude), toElevationKey(longitude)],
      elevation
    )


    const action = startRide(firstCoord, firstElevation, startTime)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

})
