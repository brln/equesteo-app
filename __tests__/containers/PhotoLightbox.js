import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import PhotoLightboxContainer from '../../containers/PhotoLightbox'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {},
    localState: {},
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <PhotoLightboxContainer />
    </Provider>).toJSON()
  expect(tree).toMatchSnapshot()
})

