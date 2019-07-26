import { fromJS } from "immutable"
import {
  viewHorseOwnerIDs,
  viewHorsesByUserID
} from "../../dataViews/dataViews"

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
