import { Map, fromJS } from 'immutable'

import React from 'react'
import TrainingCard from '../../../components/HorseProfile/TrainingCard'

import { trainingDataByDay } from '../../__testData__/trainingData'

describe('TrainingCard', () => {
  it("parses the training data", () => {
    const data = fromJS(trainingDataByDay)
    const result = TrainingCard.calcs(data, (new Date('2019-07-29T07:00:00.000Z')))
    const expected = {
      "rides": {
        "thisWeek": 0,
        "thisMonth": 1,
        "thisYear": 8,
        "allTime": 8
      },
      "miles": {
        "thisWeek": 0,
        "thisMonth": 34.55932299999999,
        "thisYear": 79.924456,
        "allTime": 79.924456
      },
      "hours": {
        "thisWeek": 0,
        "thisMonth": 2.6947797222222225,
        "thisYear": 17.627410277703603,
        "allTime": 17.627410277703603
      }
    }
    expect(result).toEqual(expected)
  })
})
