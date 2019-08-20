import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import CameraContainer from '../../containers/Camera'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    currentRide: {},
    localState: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <CameraContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

