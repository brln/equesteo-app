import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import BarnContainer from '../../containers/Barn'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    localState: {},
    pouchRecords: {
      horses: {},
      horseUsers: {}
    }
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <BarnContainer/>
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

