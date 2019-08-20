import configureStore from 'redux-mock-store'
import React from "react"
import {fromJS, Map} from "immutable"
import renderer from "react-test-renderer"
import { Provider } from 'react-redux'
import thunk from "redux-thunk"

import LeaderboardsContainer from '../../containers/Leaderboards'


const mockStore = configureStore([thunk])

test('render', () => {
  const store = mockStore(fromJS({
    localState: {},
    pouchRecords: {
      horseUsers: {},
      leaderboards: {
        values: {
          week: {
            distance: {},
            elevationGain: {},
            elapsedTimeSecs: {},
          },
          month: {
            distance: {},
            elevationGain: {},
            elapsedTimeSecs: {},
          },
          year: {
            distance: {},
            elevationGain: {},
            elapsedTimeSecs: {},
          }
        }
      },
    },
  }))

  const tree = renderer.create(
    <Provider store={store}>
      <LeaderboardsContainer />
    </Provider>)
  expect(tree.toJSON()).toMatchSnapshot()
})

