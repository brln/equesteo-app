import { Map, fromJS } from 'immutable'

import React from 'react'

import { trainingData, trainingDataByDay } from '../__testData__/trainingData'
import renderer from "react-test-renderer"
import {Provider} from "react-redux"
import ProfileContainer from '../../containers/Profile'
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"


const mockStore = configureStore([thunk])

describe('profileContainer', () => {
  it("parses the training data", () => {
    const userID1 = 'e1e41f0855c13d487ec6753ee8ec7895'
    const user = fromJS({ _id: userID1 })

    const users = fromJS({
      'e1e41f0855c13d487ec6753ee8ec7895': user
    })

    const parsed = ProfileContainer.trainings(
      fromJS(trainingData),
      users,
      Map(),
      Map(),
      Map(),
      Map(),
      user
    )
    expect(parsed).toEqual(fromJS(trainingDataByDay))
  })

  it ('renders', () => {
    const store = mockStore(fromJS({
      pouchRecords: {},
      localState: {},
    }))

    const tree = renderer.create(
      <Provider store={store}>
        <ProfileContainer />
      </Provider>).toJSON()
    expect(tree).toMatchSnapshot()
  })

})