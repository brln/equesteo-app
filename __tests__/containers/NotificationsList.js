import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import NotificationsListContainer from '../../containers/NotificationsList'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      notifications: {},
    },
    localState: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <NotificationsListContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

