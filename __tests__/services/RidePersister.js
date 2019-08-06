import { fromJS, List, Map } from 'immutable'
import { createStore, applyMiddleware } from 'redux'

import RidePersister from '../../services/RidePersister'
import {combineReducers} from "redux-immutable"
import PouchRecordsReducer from "../../reducers/PouchRecords"
import LocalStateReducer from "../../reducers/LocalState"
import CurrentRideReducer from "../../reducers/CurrentRide"
import thunkMiddleware from "redux-thunk"
import logger from "../../middleware/logger"
import storeLocalState from "../../middleware/localstate"

import {rideUpdated, updatePhotoStatus} from '../../actions/standard'
import functional from "../../actions/functional"

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

  it ('persists a ride with photos', () => {
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

    const store = createStore(
      combineReducers({
        pouchRecords: PouchRecordsReducer,
        localState: LocalStateReducer,
      }),
      undefined,
      applyMiddleware(
        thunkMiddleware,
      )
    )

    const ridePhotos = fromJS({
      'id1':
        { _id: 'id1',
          uri: 'uri1',
          userID: '3522a01c3bf3032ef03838d658b9400f',
          timestamp: 1,
          lat: 37.33080974,
          lng: -122.03057107,
          accuracy: 10,
          type: 'ridePhoto' },
      'id2':
        { _id: 'id2',
          uri: 'uri2',
          userID: '3522a01c3bf3032ef03838d658b9400f',
          timestamp: 2,
          lat: 37.33080974,
          lng: -122.03057107,
          accuracy: 10,
          type: 'ridePhoto'
        },
      'id3':
        { _id: 'id3',
          uri: 'uri3',
          userID: '3522a01c3bf3032ef03838d658b9400f',
          timestamp: 3,
          lat: 37.33080974,
          lng: -122.03057107,
          accuracy: 10,
          type: 'ridePhoto' },
      'id4':
        { _id: 'id4',
          uri: 'uri4',
          userID: '3522a01c3bf3032ef03838d658b9400f',
          timestamp: 4,
          lat: 37.33080974,
          lng: -122.03057107,
          accuracy: 10,
          type: 'ridePhoto' },
    })

    functional.uploadPhoto = jest.fn((type, photoLocation, photoID) => {
      return () => {
        store.dispatch(updatePhotoStatus(photoID, 'uploading'))
      }
    })

    const mockPouch = new MockPouch()
    store.dispatch(rideUpdated(ride))

    const expected = fromJS({
      'id1':
        { _rev: 3,
         lng: -122.03057107,
         userID: '3522a01c3bf3032ef03838d658b9400f',
         uri: 'uri1',
         rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
         timestamp: 1,
         accuracy: 10,
         _id: 'id1',
         type: 'ridePhoto',
         lat: 37.33080974 },
      'id2':
        { _rev: 4,
         lng: -122.03057107,
         userID: '3522a01c3bf3032ef03838d658b9400f',
         uri: 'uri2',
         rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
         timestamp: 2,
         accuracy: 10,
         _id: 'id2',
         type: 'ridePhoto',
         lat: 37.33080974 },
      'id3':
        { _rev: 5,
          lng: -122.03057107,
          userID: '3522a01c3bf3032ef03838d658b9400f',
          uri: 'uri3',
          rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
          timestamp: 3,
          accuracy: 10,
          _id: 'id3',
          type: 'ridePhoto',
          lat: 37.33080974 },
      'id4':
        { _rev: 6,
          lng: -122.03057107,
          userID: '3522a01c3bf3032ef03838d658b9400f',
          uri: 'uri4',
          rideID: '3522a01c3bf3032ef03838d658b9400f_1564701204237',
          timestamp: 4,
          accuracy: 10,
          _id: 'id4',
          type: 'ridePhoto',
          lat: 37.33080974 },
     })

    const ridePersister = new RidePersister(store.dispatch, store.getState, rideID, mockPouch)
    return ridePersister.persistRide(false, rideCoordinates, rideElevations, ridePhotos).then(() => {
      expect(mockPouch.saves[0].type).toBe('rideCoordinates')
      expect(mockPouch.saves[1].type).toBe('ride')
      expect(store.getState().getIn(['pouchRecords', 'ridePhotos'])).toEqual(expected)
      expect(functional.uploadPhoto.mock.calls.length).toEqual(4)
    })
  })
})

