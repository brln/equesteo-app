import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import RideAtlasContainer from '../../containers/RideAtlas'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      rideAtlasEntries: {}
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <RideAtlasContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

