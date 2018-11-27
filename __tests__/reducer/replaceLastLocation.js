import { fromJS, List, Map } from 'immutable'

import 'react-native';
import React from 'react';

import CurrentRideReducer from '../../reducers/CurrentRide'
import { newLocation, replaceLastLocation }  from '../../actions'
import { unixTimeNow } from '../../helpers'

describe('REPLACE_LAST_LOCATION', () => {
  it('should replace last location and elevation', () => {
    const initialState = Map({
      lastLocation: 'some old location',
      lastElevation: 'some old elevation'
    })
    const newLocation = Map({latitude: 1, longitude: 1, accuracy: 1, timestamp: 1})
    const newElevation = Map({'some new': 'elevation'})
    const newState = Map({
      lastLocation: newLocation,
      lastElevation: newElevation,
    })

    expect(CurrentRideReducer(initialState, replaceLastLocation(newLocation, newElevation))).toEqual(newState)
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
      currentRide: Map({
        startTime: startTime,
        distance: 0,
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([firstPoint]),
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map(firstElevation)
      }),
      lastElevation: firstElevation,
      lastLocation: firstPoint,
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
        startTime: startTime,
        distance: 0,
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([List([latitude, longitude, 1, 5])]),
      }),
      currentRideElevations: Map({
        elevationGain: 0,
        elevations: Map()
      }),
      lastLocation: location,
      refiningLocation: firstPoint,
      lastElevation: elevation,
    })
    expectedNewState = expectedNewState.setIn(
      ['currentRideElevations', 'elevations', latitude.toFixed(4), longitude.toFixed(4)],
      elevationPoint
    )

    expect(CurrentRideReducer(initialState, replaceLastLocation(location, elevation))).toEqual(expectedNewState)
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
      latitude: 45.230098,
      longitude: 27.300023,
      elevation: 110
    })
    const initialElevation = Map({
      elevationGain: 10,
      elevations: Map({
        '45.2200': Map({'27.2900': 100}),
        '45.2301': Map({'27.3000': 110})
      })
    })

    const initialState = Map({
      currentRide: Map({
        startTime: startTime,
        distance: 25,
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([
          Map({some: 'point'}),
          List([firstPoint.get('latitude'), firstPoint.get('longitude'), firstPoint.get('timestamp'), firstPoint.get('accuracy')]),
          List([secondPoint.get('latitude'), secondPoint.get('longitude'), secondPoint.get('timestamp'), secondPoint.get('accuracy')]),
        ]),
      }),
      currentRideElevations: initialElevation,
      lastElevation,
      lastLocation: secondPoint,
      refiningLocation: firstPoint,
    })
    let latitude = 45.21323
    let longitude = 27.28923
    let elevationPoint = 120
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
        distance: 24.62141,
      }),
      currentRideCoordinates: Map({
        rideCoordinates: List([
          Map({some: 'point'}),
          List([firstPoint.get('latitude'), firstPoint.get('longitude'), firstPoint.get('timestamp'), firstPoint.get('accuracy')]),
          List([latitude, longitude, 1, 5])]),
      }),
      currentRideElevations: Map({
        elevationGain: 20,
        elevations: Map({
          '45.2200': Map({'27.2900': 100}),
          '45.2301': Map({'27.3000': 110}),
          '45.2132': Map({'27.2892': elevationPoint})
        })
      }),
      lastLocation: location,
      refiningLocation: firstPoint,
      lastElevation: elevation,
    })

    expect(CurrentRideReducer(initialState, replaceLastLocation(location, elevation))).toEqual(expectedNewState)
    expect(
      CurrentRideReducer(
        initialState,
        replaceLastLocation(location, elevation)
      ).getIn(
        ['currentRideCoordinates', 'rideCoordinates']
      ).count()
    ).toEqual(3)
  })

  it('should not screw up if theres rounding!', () => {
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

    let latitude = 57.28046553791769
    let longitude = 134.85876184837394
    let elevationPoint = 100
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
    let newState = CurrentRideReducer(initialState, newLocation(location, elevation))

    latitude = 5.242249617518764
    longitude = 156.67569432673565
    elevationPoint = 105
    location = Map({
      accuracy: 5,
      latitude: latitude,
      longitude: longitude,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    elevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation: elevationPoint,
    })
    newState = CurrentRideReducer(newState, newLocation(location, elevation))

    latitude = 45.111111999
    longitude = 27.28923333
    elevationPoint = 110
    location = Map({
      accuracy: 5,
      latitude: latitude,
      longitude: longitude,
      provider: 'gps',
      timestamp: 1,
      speed: 1,
    })
    elevation = Map({
      latitude: latitude,
      longitude: longitude,
      elevation: elevationPoint,
    })
    newState = CurrentRideReducer(newState, replaceLastLocation(location, elevation))

    const expectedState = fromJS({
      currentRide: {
        startTime: startTime, distance: 4232.586925
      },
      currentRideElevations:
       { elevationGain: 10,
         elevations: { '57.2805': {'134.8588': 100}, '5.2423': {'156.6757': 105}, '45.1111': {'27.2892': 110} } },
      currentRideCoordinates: { rideCoordinates: [ [57.280466, 134.858762, 1, 5], [45.111112, 27.289233, 1, 5] ] },
      lastElevation: { latitude: 45.111111999, longitude: 27.28923333, elevation: 110 },
      lastLocation:
       { accuracy: 5,
         latitude: 45.111111999,
         longitude: 27.28923333,
         provider: 'gps',
         timestamp: 1,
         speed: 1 },
      refiningLocation:
       { accuracy: 5,
         latitude: 5.242249617518764,
         longitude: 156.67569432673565,
         provider: 'gps',
         timestamp: 1,
         speed: 1 }
    })

    expect(newState).toEqual(expectedState)
  })
})