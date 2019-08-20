import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import SettingsContainer from '../../containers/Settings'


const mockStore = configureStore([thunk])

test('render', () => {
  const userID = 'userID1'
  const store = mockStore(fromJS({
    localState: {
      userID: userID
    },
    pouchRecords: {
      users: {
        userID1: {
          _id: userID
        }
      }
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <SettingsContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

