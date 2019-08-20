import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import TrainingContainer from '../../containers/Training'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      horseUsers: {},
      users: {},
    },
    localState: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <TrainingContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

