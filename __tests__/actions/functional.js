import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { fromJS } from 'immutable'

import * as helpers from '../../helpers'
import functional from '../../actions/functional'

const mockStore = configureStore([thunk])

describe('duplicateRide', () => {
  it('duplicates the ride', () => {
    const rideID = 'someRideID'
    const rideCoordinates = fromJS({
      _id: 'rideCoords1'
    })
    const rideElevations = fromJS({
      _id: 'rideElevations1'
    })
    const ride = fromJS({_id: rideID})

    const store = mockStore(fromJS({
      localState: {
        goodConnection: true,
        photoQueue: [],
      },
      pouchRecords: {
        rides: {
          someRideID: ride
        },
        selectedRideCoordinates: rideCoordinates,
        selectedRideElevations: rideElevations,
      }
    }))

    const userID = 'userid1'
    functional.doSync = jest.fn(() => { return () => { Promise.resolve() } })

    helpers.rideIDGenerator = jest.fn(() => rideID)
    return store.dispatch(functional.duplicateRide(userID, ride, rideElevations, rideCoordinates)).then(() => {
      const actions = store.getActions()
      expect(actions.map(a => a.type)).toEqual([
        'CREATE_RIDE',
        'RIDE_ELEVATIONS_LOADED',
        'RIDE_COORDINATES_LOADED',
        'RIDE_UPDATED'
      ])
    })
  })
})
