import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import Feed from '../../../containers/Feed/Feed'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    currentRide: {},
    pouchRecords: {
      follows: {},
      horseUsers: {},
      notifications: {},
      rideHorses: {},
      rideCarrots: {},
      rideComments: {},
      rides: {},
      users: {},
    },
    localState: {}
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <Feed />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

