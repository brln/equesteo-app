import PouchDB from 'pouchdb-react-native'
import { API_URL } from 'react-native-dotenv'

import { logInfo } from '../helpers'
import ApiClient from './ApiClient'

const horsesDBName = 'horses'
const ridesDBName = 'rides'
const usersDBName = 'users'

const localHorsesDB = new PouchDB(horsesDBName)
const localRidesDB = new PouchDB(ridesDBName)
const localUsersDB = new PouchDB(usersDBName)

const getRemoteHeaders = () => {
  return {
    ajax: {
      headers: {'Authorization': 'Bearer: ' + ApiClient.getToken()}
    }
  }
}

export default class PouchCouch {
  static saveHorse (horseData) {
    return localHorsesDB.put(horseData)
  }

  static saveRide (rideData) {
    return localRidesDB.put(rideData)
  }

  static saveUser (userData) {
    return localUsersDB.put(userData)
  }

  static deleteRide (id, rev) {
    return localRidesDB.remove(id, rev)
  }

  static remoteReplicateDB(db) {
    switch(db) {
      case 'horses':
        return PouchCouch.remoteReplicateHorses()
      case 'rides':
        return PouchCouch.remoteReplicateRides()
      case 'users':
        return PouchCouch.remoteReplicateUsers()
      default:
        throw('Remote DB not found')
    }
  }

  static remoteReplicateHorses () {
    return ApiClient.checkAuth().then(() => {
      const remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, getRemoteHeaders())
      return new Promise((res, rej) => {
        PouchDB.replicate(localHorsesDB, remoteHorsesDB).on('complete', (resp) => {
          res(resp)
        }).on('error', (e) => {
          rej(e)
        })
      })
    })
  }

  static remoteReplicateRides () {
    return ApiClient.checkAuth().then(() => {
      const remoteRidesDB = new PouchDB(`${API_URL}/couchproxy/${ridesDBName}`, getRemoteHeaders())
      return new Promise((res, rej) => {
        PouchDB.replicate(localRidesDB, remoteRidesDB).on('complete', (resp) => {
          res(resp)
        }).on('error', (e) => {
          rej(e)
        })
      })
    })
  }

  static remoteReplicateUsers () {
    return ApiClient.checkAuth().then(() => {
      const remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, getRemoteHeaders())
      return new Promise((res, rej) => {
        PouchDB.replicate(localUsersDB, remoteUsersDB).on('complete', (resp) => {
          res(resp)
        }).on('error', (e) => {
          rej(e)
        })
      })
    })
  }

  static localReplicateDB(db, userIDs, followerUserIDs) {
    switch(db) {
      case 'horses':
        return PouchCouch.localReplicateHorses([...userIDs, ...followerUserIDs])
      case 'rides':
        return PouchCouch.localReplicateRides(userIDs, followerUserIDs)
      case 'users':
        return PouchCouch.localReplicateUsers([...userIDs, ...followerUserIDs])
      case 'all':
        const rideReplicate = PouchCouch.localReplicateRides(userIDs, followerUserIDs)
        const userReplicate = PouchCouch.localReplicateUsers([...userIDs, ...followerUserIDs])
        const horsesReplicate = PouchCouch.localReplicateHorses([...userIDs, ...followerUserIDs])
        return Promise.all([rideReplicate, horsesReplicate, userReplicate])
      default:
        throw('Local DB not found')
    }
  }

  static localReplicateRides (userIDs, followerUserIDs) {
    return ApiClient.checkAuth().then(() => {
      return new Promise((resolve, reject) => {
        const remoteRidesDB = new PouchDB(`${API_URL}/couchproxy/${ridesDBName}`, getRemoteHeaders())
        PouchDB.replicate(
          remoteRidesDB,
          localRidesDB,
          {
            live: false,
            filter: 'rides/byUserIDs',
            query_params: {
              userIDs: userIDs.join(','),
              followerUserIDs: followerUserIDs.join(',')
            }
          }
        ).on('complete', () => {
          resolve()
        }).on('error', (e) => {
          reject(e)
        })
      })
    })
  }

  static localReplicateUsers () {
    return ApiClient.checkAuth().then(() => {
      return new Promise((resolve, reject) => {
        const remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, getRemoteHeaders())
        PouchDB.replicate(
          remoteUsersDB,
          localUsersDB,
          {
            live: false,
          }
        ).on('complete', () => {
            resolve()
        }).on('error', (e) => {
          reject(e)
        })
      })
    })
  }

  static localReplicateHorses (userIDs) {
    return ApiClient.checkAuth().then(() => {
      return new Promise((resolve, reject) => {
        const remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, getRemoteHeaders())
        remoteHorsesDB.query('horses/allJoins', {}).then((resp) => {
          const fetchIDs = []
          for (let row of resp.rows) {
            const joinID = row.id
            const userID = row.key
            const horseID = row.value
            if (userIDs.indexOf(userID) >= 0) {
              fetchIDs.push(joinID)
              if (fetchIDs.indexOf(horseID) < 0) {
                fetchIDs.push(horseID)
              }
            }
          }
          return fetchIDs
        }).then(fetchIDs => {
          const remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, getRemoteHeaders())
          PouchDB.replicate(
            remoteHorsesDB,
            localHorsesDB,
            {
              live: false,
              doc_ids: fetchIDs,
            }
          ).on('complete', () => {
            resolve()
          }).on('error', (e) => {
            throw e
          })
        }).catch((e) => {
          reject(e)
        })
      })
    })
  }

  static deleteLocalDBs () {
    logInfo('deleting all local DBs')
    return Promise.all([
      localHorsesDB.destroy(),
      localUsersDB.destroy(),
      localRidesDB.destroy(),
    ])
  }

  static localLoad () {
    return Promise.all([
      localHorsesDB.allDocs(),
      localRidesDB.allDocs(),
      localUsersDB.allDocs(),
    ]).then(([horsesResp, ridesResp, usersResp]) => {
      const rideDocs = ridesResp.rows.map(r => r.doc)
      const userDocs = usersResp.rows.map(u => u.doc)
      const horseDocs = horsesResp.rows.map(h => h.doc)
      return {
        horses: horseDocs.filter(h => h.type === 'horse'),
        horsePhotos: horseDocs.filter(h => h.type === 'horsePhoto'),
        horseUsers: horseDocs.filter(h => h.type === 'horseUser'),
        follows: userDocs.filter(u => u.type === 'follow'),
        rideCarrots: rideDocs.filter(r => r.type === 'carrot'),
        rideCoordinates: rideDocs.filter(r => r.type === 'rideCoordinates'),
        rideComments: rideDocs.filter(r => r.type === 'comment'),
        rideElevations: rideDocs.filter(r => r.type === 'rideElevations'),
        ridePhotos: rideDocs.filter(r => r.type === 'ridePhoto'),
        rideHorses: rideDocs.filter(r => r.type === 'rideHorse'), // this getting silly, only iterate once
        rides: rideDocs.filter(r => r.type === 'ride'),
        users: userDocs.filter(u => u.type === 'user'),
        userPhotos: userDocs.filter(u => u.type === 'userPhoto')
      }
    })
  }

  static loadRideCoordinates (rideID) {
    return localRidesDB.get(`${rideID}_coordinates`)
  }
}