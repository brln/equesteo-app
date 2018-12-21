import PouchDB from 'pouchdb-react-native'
import { API_URL } from 'react-native-dotenv'

import { logInfo } from '../helpers'
import ApiClient from './ApiClient'

const horsesDBName = 'horses'
const ridesDBName = 'rides'
const usersDBName = 'users'

let localHorsesDB = new PouchDB(horsesDBName)
let localRidesDB = new PouchDB(ridesDBName)
let localUsersDB = new PouchDB(usersDBName)

// PouchDB.debug.enable('*')

function remoteDBOptions (token) {
  return {
    ajax: {
      headers: {'Authorization': 'Bearer: ' + token}
    },
    skip_setup: true
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
    let remoteConnectionString
    let localDB
    const options = PouchCouch.preReplicate()
    switch(db) {
      case 'horses':
        localDB = localHorsesDB
        remoteConnectionString = `${API_URL}/couchproxy/${horsesDBName}`
        break
      case 'rides':
        localDB = localRidesDB
        remoteConnectionString = `${API_URL}/couchproxy/${ridesDBName}`
        break
      case 'users':
        localDB = localUsersDB
        remoteConnectionString = `${API_URL}/couchproxy/${usersDBName}`
        break
      default:
        throw('Remote DB not found')
    }
    return options.then(options => {
      const remoteDB = new PouchDB(remoteConnectionString, options)
      return PouchDB.replicate(localDB, remoteDB).on('complete', (resp) => {
        res(resp)
      }).on('error', (e) => {
        rej(e)
      })
    })

  }

  static preReplicate () {
    return ApiClient.checkAuth().then(() => {
      return ApiClient.getToken()
    }).then(token => {
      return remoteDBOptions(token)
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
        return Promise.all([
          PouchCouch.localReplicateRides(userIDs, followerUserIDs),
          PouchCouch.localReplicateUsers([...userIDs, ...followerUserIDs]),
          PouchCouch.localReplicateHorses([...userIDs, ...followerUserIDs]),
        ])

      default:
        throw('Local DB not found')
    }
  }

  static localReplicateRides (userIDs, followerUserIDs) {
    return PouchCouch.preReplicate().then((options) => {
      const remoteRidesDB = new PouchDB(`${API_URL}/couchproxy/${ridesDBName}`, options)
      return new Promise((resolve, reject) => {
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
        ).on('complete', (resp) => {
          resolve(resp)
        }).on('error', (e) => {
          logDebug('ride error')
          reject(e)
        })
      })
    })
  }

  static localReplicateUsers () {
    return PouchCouch.preReplicate().then(options => {
      const remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, options)
      return new Promise((resolve, reject) => {
        PouchDB.replicate(
          remoteUsersDB,
          localUsersDB,
          {
            live: false,
          }
        ).on('complete', () => {
            resolve()
        }).on('error', (e) => {
          logDebug('user error')
          reject(e)
        });
      })
    })
  }

  static localReplicateHorses (userIDs) {
    return PouchCouch.preReplicate().then((options) => {
      return new Promise((resolve, reject) => {
        const remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, options)
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
          logDebug('horse error')
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
    ]).then(() => {
      localHorsesDB = new PouchDB(horsesDBName)
      localRidesDB = new PouchDB(ridesDBName)
      localUsersDB = new PouchDB(usersDBName)
    })
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