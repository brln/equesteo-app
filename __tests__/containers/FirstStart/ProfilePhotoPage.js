import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import ProfilePhotoPage from '../../../containers/FirstStart/ProfilePhotoPage'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    localState: {
      userID: 'userID1'
    },
    pouchRecords: {
      users: {
        userID1: {
          _id: 'userID1'
        }
      }
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <ProfilePhotoPage />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})
