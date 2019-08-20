import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import UpdateProfileContainer from '../../containers/UpdateProfile'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      horseUsers: {},
      users: {
        userID1: {
          _id: 'userID1'
        }
      },
      userPhotos: {}
    },
    localState: {
      userID: 'userID1'
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <UpdateProfileContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

