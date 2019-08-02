import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import ColorPickerContainer from '../../../containers/UpdateHorse/ColorPicker'


const mockStore = configureStore([thunk])

test('renders', () => {
  const horseID1 = 'horseID1'
  const store = mockStore(fromJS({
    pouchRecords: {
      horses: {
        horseID1: {
          _id: horseID1
        }
      }
    }
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <ColorPickerContainer
        horseID={horseID1}
      />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
});
