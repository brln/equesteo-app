import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import FindPeopleContainer from '../../containers/FindPeople'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {},
    localState: {
      userSearchResults: {},
    }
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <FindPeopleContainer />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

