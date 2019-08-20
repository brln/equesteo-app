import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import FirstHorsePhoto from '../../../containers/FirstStart/FirstHorsePhoto'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    localState: {
      firstStartHorseID: {
        horseID: 'horseID1',
        horseUserID: 'horseUserID1'
      }
    },
    pouchRecords: {
      horses: {
        horseID1: {
          _id: 'horseID1'
        }
      }
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <FirstHorsePhoto />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

