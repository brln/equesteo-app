import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import RideButton from '../../../containers/Feed/RideButton'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    currentRide: {}
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <RideButton />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

