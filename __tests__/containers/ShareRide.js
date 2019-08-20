import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import ShareRideContainer from '../../containers/ShareRide'


const mockStore = configureStore([thunk])

test('render', () => {
  const rideID = 'rideID1'
  const userID = 'userID1'
  const store = mockStore(fromJS({
    pouchRecords: {
      rides: {
        rideID1: {
          _id: rideID,
          userID: userID
        }
      },
      selectedRideCoordinates: {
        rideCoordinates: []
      },
      users: {
        'userID1': {
          _id: userID
        }
      },
      horseUsers: {},
      notifications: {},
      rideCarrots: {},
      rideComments: {},
      rideHorses: {},
      ridePhotos: {},
    },
    localState: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <ShareRideContainer
        rideID={rideID}
      />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

