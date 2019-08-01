import { Map, fromJS } from 'immutable'

import React from 'react'
import ProfileContainer from '../../containers/Profile'

import { trainingData, trainingDataByDay } from '../__testData__/trainingData'

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
})