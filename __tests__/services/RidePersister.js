import { fromJS, List, Map } from 'immutable'

import RidePersister from '../../services/RidePersister'

class MockPouch {
  constructor () {
    this.saves = []
    this.rev = 0
  }

  saveRide (ride) {
    this.saves.push(ride)
    this.rev += 1
    return Promise.resolve({ rev: this.rev })
  }
}

describe("RidePersister service", () => {
  it('persists a new ride', () => {
    const rideID = '3522a01c3bf3032ef03838d658b9400f_1564701204237'
    const ride = fromJS({
      notes: null,
      userID: '3522a01c3bf3032ef03838d658b9400f',
      elapsedTimeSecs: 22.836,
      name: 'Afternoon Ride',
      startTime: 1564701179138,
      isPublic: true,
      mapURL: 'https://api.mapbox.com/styles/v1/equesteo/cjn3zysq408tc2sk1g1gunqmq/static/path-5+ea5b60(y%7DxbFp~wgVI%5Cc%40D_A%3F)/auto/600x400',
      photosByID: {},
      duplicateFrom: null,
      distance: 0.042888,
      coverPhotoID: null,
      horseID: '3522a01c3bf3032ef03838d658b9400f_1547228190849',
      _id: rideID,
      type: 'ride'
    })

    const rideElevations = fromJS({
      _id: '3522a01c3bf3032ef03838d658b9400f_1564701204237_elevations',
      rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
      elevationGain: 0,
      elevations:
       { '37.3246': { '-122.0249': 0 },
         '37.3247': { '-122.0250': 0 },
         '37.3248': { '-122.0251': 0 },
         '37.3250': { '-122.0251': 0 },
         '37.3252': { '-122.0251': 0 }
       },
      type: 'rideElevations',
      userID: '3522a01c3bf3032ef03838d658b9400f'
    })

    const rideCoordinates = fromJS({
      _id: '3522a01c3bf3032ef03838d658b9400f_1564701204237_coordinates',
      rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
      userID: '3522a01c3bf3032ef03838d658b9400f',
      type: 'rideCoordinates',
      rideCoordinates:
       [ [ 37.324607, -122.024893, 1564701180963.9158, 5 ],
         [ 37.324664, -122.025035, 1564701185964.258, 4.72 ],
         [ 37.324836, -122.025072, 1564701191960.047, 4.76 ],
         [ 37.325156, -122.025069, 1564701201974.845, 4.72 ] ]
    })

    const getState = function () {
      return fromJS({
        pouchRecords: {
          rides: {
            '3522a01c3bf3032ef03838d658b9400f_1564701204237': ride
          }
        }
      })
    }

    const dispatch = () => {}
    const mockPouch = new MockPouch()

    const ridePersister = new RidePersister(dispatch, getState, rideID, mockPouch)
    return ridePersister.persistRide(true, rideCoordinates, rideElevations).then(() => {
      expect(mockPouch.saves[0].type).toBe('rideElevations')
      expect(mockPouch.saves[1].type).toBe('rideCoordinates')
      expect(mockPouch.saves[2].type).toBe('ride')
    })
  })

  it('persists an existing ride', () => {
    const rideID = '3522a01c3bf3032ef03838d658b9400f_1564701204237'
    const ride = fromJS({
      notes: null,
      userID: '3522a01c3bf3032ef03838d658b9400f',
      elapsedTimeSecs: 22.836,
      name: 'Afternoon Ride',
      startTime: 1564701179138,
      isPublic: true,
      mapURL: 'https://api.mapbox.com/styles/v1/equesteo/cjn3zysq408tc2sk1g1gunqmq/static/path-5+ea5b60(y%7DxbFp~wgVI%5Cc%40D_A%3F)/auto/600x400',
      photosByID: {},
      duplicateFrom: null,
      distance: 0.042888,
      coverPhotoID: null,
      horseID: '3522a01c3bf3032ef03838d658b9400f_1547228190849',
      _id: rideID,
      type: 'ride'
    })

    const rideElevations = fromJS({
      _id: '3522a01c3bf3032ef03838d658b9400f_1564701204237_elevations',
      rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
      elevationGain: 0,
      elevations:
        { '37.3246': { '-122.0249': 0 },
          '37.3247': { '-122.0250': 0 },
          '37.3248': { '-122.0251': 0 },
          '37.3250': { '-122.0251': 0 },
          '37.3252': { '-122.0251': 0 }
        },
      type: 'rideElevations',
      userID: '3522a01c3bf3032ef03838d658b9400f'
    })

    const rideCoordinates = fromJS({
      _id: '3522a01c3bf3032ef03838d658b9400f_1564701204237_coordinates',
      rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
      userID: '3522a01c3bf3032ef03838d658b9400f',
      type: 'rideCoordinates',
      rideCoordinates:
        [ [ 37.324607, -122.024893, 1564701180963.9158, 5 ],
          [ 37.324664, -122.025035, 1564701185964.258, 4.72 ],
          [ 37.324836, -122.025072, 1564701191960.047, 4.76 ],
          [ 37.325156, -122.025069, 1564701201974.845, 4.72 ] ]
    })

    const getState = function () {
      return fromJS({
        pouchRecords: {
          rides: {
            '3522a01c3bf3032ef03838d658b9400f_1564701204237': ride
          }
        }
      })
    }

    const dispatch = () => {}
    const mockPouch = new MockPouch()

    const ridePersister = new RidePersister(dispatch, getState, rideID, mockPouch)
    return ridePersister.persistRide(false, rideCoordinates, rideElevations).then(() => {
      expect(mockPouch.saves[0].type).toBe('rideCoordinates')
      expect(mockPouch.saves[1].type).toBe('ride')
    })
  })
})

