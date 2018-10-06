import { List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import AppReducer, { initialState } from '../reducer'
import { replaceLastLocation }  from '../actions'

it('runs a test', () => {
  expect(1+1).toEqual(2)
});

describe('reducer', () => {
  it('should return initial state if it doesn\'t recognize the action', () => {
    const tinyInitialState = {'some': 'state'}
    expect(AppReducer(tinyInitialState, {type: 'NO_TYPE'})).toEqual(tinyInitialState)
  })


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


  it('should replace the only coordinate if theres only one coordinate in the new ride', () => {
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: List(
            Map({
              'some': 'coordinate'
            })
          )
        }),
        lastLocation: 'some old location',
      }),
    })
    const newLocation = Map({'some new': 'location'})
    const expectedNewState = initialState.setIn(
      ['localState', 'currentRide', 'rideCoordinates'],
      List([newLocation])
    ).setIn(
      ['localState', 'lastLocation'],
      newLocation
    )

    expect(AppReducer(initialState, replaceLastLocation(newLocation))).toEqual(expectedNewState)
  })


  it('should replace the last coordinate if theres more than one coordinate in the new ride', () => {
    const lastCoord = Map({
      'some': 'third coordinate',
      "latitude": 3,
      "longitude": 3,
    })
    const rideCoords = List([
      Map({
        'some': 'coordinate',
        "latitude": 1,
        "longitude": 1,
      }),
      Map({
        'some': 'second coordinate',
        "latitude": 2,
        "longitude": 2,
      }),
      lastCoord
    ])
    const initialState = Map({
      localState: Map({
        currentRide: Map({
          rideCoordinates: rideCoords,
          distance: 97.69549216 +  97.66574073,
        }),
        lastLocation: lastCoord,
      }),
    })
    const newLocation = Map({
      'some new': 'location',
      "latitude": 6,
      "longitude": 6,
    })
    const withNewLocation = rideCoords.pop().push(newLocation)
    const expectedNewState = initialState.setIn(
      ['localState', 'currentRide', 'rideCoordinates'],
      withNewLocation
    ).setIn(
      ['localState', 'lastLocation'],
      newLocation
    ).setIn(
      ['localState', 'currentRide', 'distance'],
      488.048463762285
    )
    console.log(expectedNewState.toJSON())

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