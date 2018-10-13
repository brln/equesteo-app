import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer from '../../reducer'
import { startRide }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('START_RIDE', () => {
  it('starts the ride', () => {
    const initialState = Map({
      localState: Map({
        currentRide: null,
      }),
    })
    const firstCoord = 'ducks'
    const startTime = unixTimeNow()
    const expectedNewState = Map({
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


    const action = startRide(firstCoord, startTime)

    expect(AppReducer(initialState, action)).toEqual(expectedNewState)
  })

})
