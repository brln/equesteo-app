import {fromJS, Map, Set} from 'immutable'
import memoizeOne from 'memoize-one'

import { logError } from '../helpers'

function allRidersButUser (trainings, users, rides, rideHorses, horses, horseUsers) {
  const allTrainings = viewTrainings(trainings, users, rides, rideHorses, horses, horseUsers)
  let byUserID = Map()
  users.forEach(user => {
    let peopleWhoRideYourHorses = Map()
    allTrainings.get(user.get('_id')).forEach(ride => {
      if (ride.get('userID') !== user.get('_id')) {
        peopleWhoRideYourHorses = peopleWhoRideYourHorses.set(
          ride.get('userID'),
          users.get(ride.get('userID'))
        )
      }
    })
    byUserID = byUserID.set(user.get('_id'), peopleWhoRideYourHorses)
  })
  return byUserID
}

function horsesByUserID (horseUsers, horses) {
  let byID = {}
  horseUsers.forEach((hu) => {
    if (hu.get('deleted') !== true) {
      if (!byID[hu.get('userID')]) {
        byID[hu.get('userID')] = []
      }
      const horse = horses.get(hu.get('horseID'))
      if (horse) {
        byID[hu.get('userID')].push(horse)
      } else {
        logError(`Should have horse in horsesByUserID but don't: ${hu.get('horseID')}`)
      }
    }
  })
  return fromJS(byID)
}

function horseOwnerIDs (horseUsers) {
  let byID = {}
  horseUsers.forEach((hu) => {
    if (hu.get('owner') && hu.get('deleted') !== true) {
      byID[hu.get('horseID')] = hu.get('userID')
    }
  })
  return fromJS(byID)
}

function horsesByRide (rideHorses, horses) {
  let byRideID = {}
  rideHorses.forEach(rideHorse => {
    if (rideHorse.get('deleted') !== true) {
      if (!byRideID[rideHorse.get('rideID')]) {
        byRideID[rideHorse.get('rideID')] = {
          horses: [],
          riderHorse: null
        }
      }
      const horse = horses.get(rideHorse.get('horseID'))
      if (horse) {
        byRideID[rideHorse.get('rideID')].horses.push(horse)
      } else {
        logError(`Should have horse in horsesByRide but don't: ${rideHorse.get('horseID')}`)
      }

      if (rideHorse.get('rideHorseType') === 'rider') {
        byRideID[rideHorse.get('rideID')].riderHorse = horse
      }
    }
  })
  return fromJS(byRideID)
}

function trainings (trainings, users, rides, rideHorses, horses, horseUsers) {
  let byUserID = Map()
  users.forEach((user) => {
    const userID = user.get('_id')
    let byRideID = Map()
    trainings.getIn([`${userID}_training`, 'rides']).forEach(training => {
      if (training.get('deleted') !== true) {
        byRideID = byRideID.set(training.get('rideID'), training)
      }
    })

    const usersHorses = viewHorsesByUserID(horseUsers, horses).get(userID)
    const usersHorseIDs = usersHorses ? usersHorses.map(horse =>{
      return horse.get('_id')
    }).toSet() : Set()

    rides.forEach((ride, rideID) => {
      if (!byRideID.get(rideID)) {
        const rideHorseData = viewHorsesByRide(rideHorses, horses).get(rideID)
        const horseIDs = rideHorseData.get('horses').map(horse => {
          return horse.get('_id')
        })
        const intersect = usersHorseIDs.intersect(horseIDs.toSet())
        if (intersect.count() > 0) {
          byRideID = byRideID.set(rideID, fromJS({
            rideID: rideID,
            elapsedTimeSecs: ride.get('elapsedTimeSecs'),
            startTime: ride.get('startTime'),
            distance: ride.get('distance'),
            userID: ride.get('userID'),
            isPublic: ride.get('isPublic'),
            horseIDs,
            riderHorseID: rideHorseData.getIn(['riderHorse', '_id']),
            elevationGain: 0
          }))
        }
      }
    })

    byUserID = byUserID.set(user.get('_id'), byRideID.valueSeq().toList())
  })
  return byUserID
}

export const viewAllRidersButUser = memoizeOne(allRidersButUser)
export const viewHorsesByRide = memoizeOne(horsesByRide)
export const viewHorsesByUserID = memoizeOne(horsesByUserID)
export const viewHorseOwnerIDs = memoizeOne(horseOwnerIDs)
export const viewTrainings = memoizeOne(trainings)
