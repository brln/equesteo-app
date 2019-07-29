import { fromJS, List, Map } from "immutable"
import {
  viewAllRidersButUser,
  viewHorsesByRide,
  viewHorseOwnerIDs,
  viewHorsesByUserID,
  viewTrainings,
} from "../../dataViews/dataViews"
import * as helpers from '../../helpers'

function trainingSetup () {
  const userID1 = 'userID1'
  const userID2 = 'userID2'
  const userID3 = 'userID3'
  const ride1 = fromJS({
    userID: userID1,
    elapsedTimeSecs: 4238.982,
    startTime: 1555858691201,
    rideID: 'fd66130136a86a59f98d403c706220d5_1555862930183',
    isPublic: true,
    distance: 6.387437999999997,
    horseIDs:
      [ 'fd66130136a86a59f98d403c706220d5_1555849838985',
        'fd66130136a86a59f98d403c706220d5_1555849969030' ],
    elevationGain: 246.33092893912092,
    riderHorseID: 'fd66130136a86a59f98d403c706220d5_1555849838985'
  })
  const ride2 = fromJS({
    userID: userID1,
    deleted: true
  })
  const trainings = fromJS({
    userID1_training: {
      rides: [
        ride1,
        ride2,
      ]
    },
    userID2_training: {rides: []},
    userID3_training: {rides: []},
  })

  const ride3ID = 'ride3ID'
  const ride4ID = 'ride4ID'
  const elapsedTimeSecs = 8
  const startTime = 15
  const distance = 12.1
  const isPublic = true
  const ride3 = {
    _id: ride3ID,
    userID: userID1,
    elapsedTimeSecs,
    startTime,
    distance,
    isPublic,
  }
  const ride4 = {
    _id: ride4ID,
    userID: userID2,
    elapsedTimeSecs,
    startTime,
    isPublic,
    distance,
  }
  const rides = fromJS({
    ride3ID: ride3,
    ride4ID: ride4,
  })
  const horseID1 = 'horseID1'
  const horseID2 = 'horseID2'
  const horses = fromJS({
    horseID1: {
      _id: horseID1
    },
    horseID2: {
      _id: horseID2
    }
  })
  const rideHorses = fromJS({
    rideHorse1: {
      rideID: ride3ID,
      horseID: horseID1,
      rideHorseType: 'packed'
    },
    rideHorse2: {
      rideID: ride3ID,
      horseID: horseID2,
      rideHorseType: 'rider'
    },
    rideHorse3: {
      rideID: 'ride4ID',
      horseID: horseID2,
      rideHorseType: 'rider'
    }
  })
  const users = fromJS({
    userID1: {
      _id: userID1
    },
    userID2: {
      _id: userID2,
    },
    userID3: {
      _id: userID3
    }
  })
  const horseUsers = fromJS({
    horseUserID1: {
      userID: userID1,
      horseID: horseID1,
    },
    horseUserID2: {
      userID: userID1,
      horseID: horseID2,
    },
    horseUserID3: {
      userID: userID2,
      horseID: horseID2,
    }
  })
  return {
    distance,
    elapsedTimeSecs,
    horses,
    horseID1,
    horseID2,
    horseUsers,
    isPublic,
    rides,
    ride1,
    ride2,
    ride4,
    ride3ID,
    ride4ID,
    rideHorses,
    startTime,
    trainings,
    users,
    userID1,
    userID2,
  }
}

describe('dataViews', () => {
  describe('viewAllRidersButUser', () => {
    it('creates the map', () => {
      const vars = trainingSetup()

      const expected = fromJS({
        "userID2": {
          _id: "userID2"
        }
      })
      const allRidersButUser = viewAllRidersButUser(
        vars.trainings,
        vars.users,
        vars.rides,
        vars.rideHorses,
        vars.horses,
        vars.horseUsers,
      )
      expect(allRidersButUser.get("userID1")).toEqual(expected)
    })
  })

  describe('viewHorsesByUserID', () => {
    it('creates the map', () => {
      const horseUsers = fromJS({
        horseUserID1: {
          userID: 'userID1',
          horseID: 'horseID1'
        },
        horseUserID2: {
          userID: 'userID2',
          horseID: 'horseID1'
        },
        horseUserID3: {
          userID: 'userID1',
          horseID: 'horseID2'
        },
        horseUserID4: {
          userID: 'userID2',
          horseID: 'horseID3',
          deleted: true
        }
      })

      const horse1 = { name: 'bojangles'}
      const horse2 = { name: 'jimmy'}
      const horses = fromJS({
        horseID1: horse1,
        horseID2: horse2,
      })

      const expectedResult = fromJS({
        userID1: [horse1, horse2],
        userID2: [horse1]
      })
      expect(viewHorsesByUserID(horseUsers, horses)).toEqual(expectedResult)
    })
  })

  describe('viewHorseOwnerIDs', () => {
    it('creates the map', () => {
      const horseUsers = fromJS({
        horseUserID1: {
          userID: 'userID1',
          horseID: 'horseID1',
          owner: true,
        },
        horseUserID2: {
          userID: 'userID2',
          horseID: 'horseID1'
        },
        horseUserID3: {
          userID: 'userID2',
          horseID: 'horseID2',
          owner: true,
        },
        horseUserID4: {
          userID: 'userID2',
          horseID: 'horseID1',
          deleted: true,
          owner: true
        },
        horseUserID5: {
          horseID: 'horseID3',
          userID: 'userID1',
          owner: true,
        }
      })

      const expectedResult = fromJS({
        horseID1: 'userID1',
        horseID2: 'userID2',
        horseID3: 'userID1',
      })
      expect(viewHorseOwnerIDs(horseUsers)).toEqual(expectedResult)
    })
  })

  describe('viewTrainings', () => {
    it('works when there\'s just trainings', () => {
      const userID1 = 'userID1'
      const ride1 = fromJS({
        userID: userID1,
        elapsedTimeSecs: 4238.982,
        startTime: 1555858691201,
        rideID: 'fd66130136a86a59f98d403c706220d5_1555862930183',
        isPublic: true,
        distance: 6.387437999999997,
        horseIDs:
          [ 'fd66130136a86a59f98d403c706220d5_1555849838985',
            'fd66130136a86a59f98d403c706220d5_1555849969030' ],
        elevationGain: 246.33092893912092,
        riderHorseID: 'fd66130136a86a59f98d403c706220d5_1555849838985'
      })
      const ride2 = fromJS({
        userID: userID1,
        deleted: true
      })
      const trainings = fromJS({
        userID1_training: { rides: [
          ride1,
          ride2,
        ]}
      })
      const expected = fromJS([ride1])
      const calcedTrainings = viewTrainings(trainings, fromJS({userID1: {_id: userID1}}), Map(), Map(), Map(), Map())
      expect(calcedTrainings.get(userID1)).toEqual(expected)
    })

    it('adds in rides when they\'re not in the trainings', () => {
      const vars = trainingSetup()
      const morphedRide3 = {
        rideID: vars.ride3ID,
        elapsedTimeSecs: vars.elapsedTimeSecs,
        startTime: vars.startTime,
        distance: vars.distance,
        userID: vars.userID1,
        isPublic: vars.isPublic,
        horseIDs: [ vars.horseID1, vars.horseID2 ],
        riderHorseID: vars.horseID2,
        elevationGain: 0
      }
      const morphedRide4 = {
        rideID: vars.ride4ID,
        elapsedTimeSecs: vars.elapsedTimeSecs,
        startTime: vars.startTime,
        distance: vars.distance,
        userID: vars.userID2,
        isPublic: vars.isPublic,
        horseIDs: [ vars.horseID2 ],
        riderHorseID: vars.horseID2,
        elevationGain: 0
      }


      const expected = fromJS([vars.ride1, morphedRide3, morphedRide4])
      const allTrainings = viewTrainings(
        vars.trainings,
        vars.users,
        vars.rides,
        vars.rideHorses,
        vars.horses,
        vars.horseUsers
      )
      expect(allTrainings.get(vars.userID1)).toEqual(expected)
    })
  })

  describe ('viewHorsesByRide', () => {
    it('creates the map', () => {
      const rideHorse1 = {
        horseID: 'horseID1',
        rideID: 'rideID1',
      }
      const rideHorse2 = {
        horseID: 'horseID1',
        rideID: 'rideID2'
      }
      const rideHorse3 = {
        rideID: 'rideID2',
        horseID: 'horseID2',
      }
      const rideHorse4 = {
        rideID: 'rideID3',
        horseID: 'horseID8',
        deleted: true,
      }
      const rideHorses = fromJS({
        rideHorse1,
        rideHorse2,
        rideHorse3,
        rideHorse4,
      })

      const horseID1 = {
        _id: 'horseID1'
      }
      const horseID2 = {
        _id: 'horseID2'
      }
      const horses = fromJS({
        horseID1,
        horseID2,
      })

      const expected = fromJS({
        rideID1: { horses: [horseID1], riderHorse: null },
        rideID2: { horses: [horseID1, horseID2], riderHorse: null },
      })
      expect(viewHorsesByRide(rideHorses, horses)).toEqual(expected)
    })

    it('borks out when there isn\'t an expected horse', () => {
      const rideHorse1 = {
        horseID: 'horseID1',
        rideID: 'rideID1',
      }
      const rideHorse2 = {
        horseID: 'horseID1',
        rideID: 'rideID2'
      }
      const rideHorse3 = {
        rideID: 'rideID2',
        horseID: 'horseID2',
      }
      const rideHorse4 = {
        rideID: 'rideID3',
        horseID: 'horseID8',
      }
      const rideHorses = fromJS({
        rideHorse1,
        rideHorse2,
        rideHorse3,
        rideHorse4,
      })

      const horseID1 = {
        _id: 'horseID1'
      }
      const horseID2 = {
        _id: 'horseID2'
      }
      const horses = fromJS({
        horseID1,
        horseID2,
      })

      const expected = fromJS({
        rideID1: { horses: [horseID1], riderHorse: null },
        rideID2: { horses: [horseID1, horseID2], riderHorse: null },
        rideID3: { horses: [], riderHorse: null },
      })

      helpers.logError = jest.fn(() => {})
      expect(viewHorsesByRide(rideHorses, horses)).toEqual(expected)
      expect(helpers.logError).toHaveBeenCalled()
    })
  })
})
