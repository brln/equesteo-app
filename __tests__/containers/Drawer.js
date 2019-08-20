import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import DrawerContainer from '../../containers/Drawer'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    pouchRecords: {
      users: {}
    },
    localState: {}
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <DrawerContainer />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()

  const instance = tree.root
  const button = instance.find(el => {
    return el.props.testName === 'openBarnButton'
  })
  expect(button.props.onPress()).toBe(undefined)
})

