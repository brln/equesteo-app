import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import NeedsSyncContainer from '../../containers/NeedsSyncContainer'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      users: {}
    },
    localState: {}
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <NeedsSyncContainer />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})
