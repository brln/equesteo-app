import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import MapContainer from '../../containers/Map'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      ridePhotos: {},
      selectedRideCoordinates: {
        rideCoordinates: []
      }
    }
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <MapContainer />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

