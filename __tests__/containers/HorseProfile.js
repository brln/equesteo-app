import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import HorseProfileContainer from '../../containers/HorseProfile'


const mockStore = configureStore([thunk])

test('render', () => {
  const horseID = 'horseID1'
  const horse = fromJS({
    _id: horseID
  })

  const store = mockStore(fromJS({
    pouchRecords: {
      horsePhotos: {},
      horseUsers: {},
      horses: {
        horseID1: horse,
      }
    },
    localState: {}
  }))



  const tree = renderer.create(
    <Provider store={store}>
      <HorseProfileContainer
        horse={horse}
      />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

