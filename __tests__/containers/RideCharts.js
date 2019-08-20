import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import RideChartsContainer from '../../containers/RideCharts'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      selectedRideCoordinates: {
        rideCoordinates: []
      },
      selectedRideElevations: {},
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <RideChartsContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

