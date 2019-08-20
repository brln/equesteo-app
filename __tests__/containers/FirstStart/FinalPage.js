import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import FinalPage from '../../../containers/FirstStart/FinalPage'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    localState: {},
    pouchRecords: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <FinalPage />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

