import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import UpdateHorseContainer from '../../../containers/UpdateHorse/UpdateHorse'


const mockStore = configureStore([thunk])

test('renders nothing if no horse', () => {
  const store = mockStore(fromJS({
    pouchRecords: {}
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <UpdateHorseContainer/>
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

test('render ', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      horses: {
        horseID1: {
          _id: 'horseID1'
        }
      },
      horseUsers: {
        huID1: {
          horseID: 'horseID1',
          userID: 'userID1',
        }
      },
      users: {
        userID1: {
          _id: 'userID1'
        }
      },
      horsePhotos: {}
    }
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <UpdateHorseContainer
        horseID={'horseID1'}
        horseUserID={'huID1'}
      />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})
