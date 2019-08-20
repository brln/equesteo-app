import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import RideContainer from '../../containers/Ride'


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

  const mockPouch = jest.genMockFromModule('pouchdb-react-native')
  mockPouch.get = () => { return Map() }

  const tree = renderer.create(
    <Provider store={store}>
      <RideContainer
        rideID={rideID}
      />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

