import { fromJS } from 'immutable'
import memoizeOne from 'memoize-one'

function horsesByUserID (horseUsers, horses) {
  let byID = {}
  horseUsers.forEach((hu) => {
    if (hu.get('deleted') !== true) {
      if (!byID[hu.get('userID')]) {
        byID[hu.get('userID')] = []
      }
      byID[hu.get('userID')].push(horses.get(hu.get('horseID')))
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

export const viewHorsesByUserID = memoizeOne(horsesByUserID)
export const viewHorseOwnerIDs = memoizeOne(horseOwnerIDs)
