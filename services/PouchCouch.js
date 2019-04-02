import PouchDB from 'pouchdb-react-native'
import { API_URL } from '../dotEnv'

import { NotConnectedError } from "../errors"
import { logError, logInfo } from '../helpers'
import ApiClient from './ApiClient'

const horsesDBName = 'horses'
const notificationsDBName = 'notifications'
const ridesDBName = 'rides'
const usersDBName = 'users'

let localHorsesDB = new PouchDB(horsesDBName, {auto_compaction: true})
let localNotificationsDB = new PouchDB(notificationsDBName, {auto_compaction: true})
let localRidesDB = new PouchDB(ridesDBName, {auto_compaction: true})
let localUsersDB = new PouchDB(usersDBName, {auto_compaction: true})

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
  static errorHandler (reject) {
    return (e) => {
      if (e.status === 0) {
        reject(new NotConnectedError('Cannot find the database'))
      } else {
        reject(new Error(JSON.stringify(e)))
      }
    }
  }

  static saveHorse (horseData) {
    return localHorsesDB.put(horseData)
  }

  static saveRide (rideData) {
    return localRidesDB.put(rideData)
  }

  static saveUser (userData) {
    return localUsersDB.put(userData)
  }

  static saveNotification (notificationData) {
    return localNotificationsDB.put(notificationData)
  }

  static deleteRide (id, rev) {
    return localRidesDB.remove(id, rev)
  }

  static remoteReplicateDBs() {
    const dbs = [
      {
        local: localHorsesDB,
        remote: `${API_URL}/couchproxy/${horsesDBName}`
      },
      {
        local: localRidesDB,
        remote: `${API_URL}/couchproxy/${ridesDBName}`
      },
      {
        local: localUsersDB,
        remote: `${API_URL}/couchproxy/${usersDBName}`
      },
      {
        local: localNotificationsDB,
        remote: `${API_URL}/couchproxy/${notificationsDBName}`
      }
    ]
    return PouchCouch.preReplicate().then(options => {
      const replications = []
      for (let db of dbs) {
        const remoteDB = new PouchDB(db.remote, options)
        replications.push(
          new Promise((res, rej) => {
            PouchDB.replicate(db.local, remoteDB).on('complete', (resp) => {
              res(resp)
            }).on('error', PouchCouch.errorHandler(rej))
          })
        )
      }
      return Promise.all(replications)
    }).then(() => {
      return PouchCouch.postReplicate()
    })
  }

  // There are no hooks in Pouch to be able to swap out the JWT mid-replication,
  // so you need to make a call to make sure the token is good before, and that
  // it has remained good throughout the replicate process. Also, the overlap time
  // set in ApiClient needs to be >>> than the time it will take to replicate
  // and then refresh the token, or the next call after replication will 401 and
  // boot the user.
  static preReplicate () {
    return ApiClient.checkAuth().then(() => {
      return ApiClient.getToken()
    }).then(token => {
      return remoteDBOptions(token)
    })
  }

  static postReplicate () {
    return ApiClient.checkAuth()
  }

  static localReplicateDBs (ownUserID, followingUserIDs, followerUserIDs, progress) {
    let options
    return PouchCouch.preReplicate().then(_options => {
      options = _options
      return PouchCouch.getLeaderboardIDs(options)
    }).then((leaderboardIDs) => {
      return Promise.all([
        PouchCouch.localReplicateRides(options, ownUserID, [ownUserID, ...followingUserIDs], followerUserIDs, progress),
        PouchCouch.localReplicateHorses(options, [ownUserID, ...followingUserIDs, ...followerUserIDs, ...leaderboardIDs], progress),
        PouchCouch.localReplicateUsers(options, ownUserID, leaderboardIDs, progress),
        PouchCouch.localReplicateNotifications(options, ownUserID, progress),
      ])
    }).then(() => {
      return PouchCouch.postReplicate()
    })
  }

  static getLeaderboardIDs (options) {
    const remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteUsersDB.query('users/leaderboardUsers').then((resp) => {
        const userIDs = resp.rows.map(r => r.key)
        resolve(userIDs)
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateRides (options, ownUserID, userIDs, followerUserIDs, progress) {
    const remoteRidesDB = new PouchDB(`${API_URL}/couchproxy/${ridesDBName}`, options)
    return new Promise((resolve, reject) => {
      return remoteRidesDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        PouchDB.replicate(
          remoteRidesDB,
          localRidesDB,
          {
            batch_size: 1000,
            live: false,
            filter: 'rides/byUserIDs',
            query_params: {
              userIDs: userIDs.join(','),
              followerUserIDs: followerUserIDs.join(','),
              ownUserID,
            }
          }
        ).on('complete', info => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'rides')
          resolve(resp)
        }).on('change', (info) => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'rides')
        }).on('error', PouchCouch.errorHandler(reject))
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateNotifications (options, ownUserID, progress) {
    const remoteNotificationsDB = new PouchDB(`${API_URL}/couchproxy/${notificationsDBName}`, options)
    return new Promise((resolve, reject) => {
      return remoteNotificationsDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        PouchDB.replicate(
          remoteNotificationsDB,
          localNotificationsDB,
          {
            batch_size: 1000,
            live: false,
            filter: 'notifications/byUserIDs',
            query_params: {
              ownUserID,
            }
          }
        ).on('complete', info => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'notifications')
          resolve(resp)
        }).on('change', (info) => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'notifications')
        }).on('error', PouchCouch.errorHandler(reject))
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateUsers (options, ownUserID, userIDs, progress) {
    const remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteUsersDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        const firstFetchIDs = userIDs
        return remoteUsersDB.query('users/relevantFollows', {key: ownUserID}).then((resp) => {
          resp.rows.reduce((fetchIDs, row) => {
            if (fetchIDs.indexOf(row.value[0]) < 0) {
              fetchIDs.push(row.value[0])
            }
            return fetchIDs
          }, firstFetchIDs)
          return remoteUsersDB.query('users/relevantFollows', {keys: firstFetchIDs})
        }).then(resp2 => {
          const fetchIDs = resp2.rows.reduce((fetchIDs, row) => {
            if (fetchIDs.indexOf(row.value[0]) < 0) {
              fetchIDs.push(row.value[0])
            }
            return fetchIDs
          }, [])
          return PouchDB.replicate(
            remoteUsersDB,
            localUsersDB,
            {
              batch_size: 1000,
              live: false,
              filter: 'users/byUserIDs2',
              query_params: {
                ownUserID,
                userIDs: fetchIDs.concat(firstFetchIDs)
              }
            }
          ).on('complete', info => {
            const docs = parseInt(info.last_seq.split('-')[0])
            progress.doneDocsFunc(docs, 'users')
            resolve()
          }).on('change', (info) => {
            const docs = parseInt(info.last_seq.split('-')[0])
            progress.doneDocsFunc(docs, 'users')
          }).on('error', PouchCouch.errorHandler(reject))
        })
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateHorses (options, userIDs, progress) {
    const remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteHorsesDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        return remoteHorsesDB.query('horses/allJoins', {keys: userIDs}).then((resp) => {
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
              batch_size: 1000,
              live: false,
              doc_ids: fetchIDs,
            }
          ).on('complete', (info) => {
            const docs = parseInt(info.last_seq.split('-')[0])
            progress.doneDocsFunc(docs, 'horses')
            resolve()
          }).on('change', (info) => {
            const docs = parseInt(info.last_seq.split('-')[0])
            progress.doneDocsFunc(docs, 'horses')
          }).on('error', PouchCouch.errorHandler(reject))
        })
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static deleteLocalDBs () {
    logInfo('deleting all local DBs')
    return Promise.all([
      localHorsesDB.destroy(),
      localNotificationsDB.destroy(),
      localRidesDB.destroy(),
      localUsersDB.destroy(),
    ]).then(() => {
      localHorsesDB = new PouchDB(horsesDBName)
      localNotificationsDB = new PouchDB(notificationsDBName)
      localRidesDB = new PouchDB(ridesDBName)
      localUsersDB = new PouchDB(usersDBName)
    })
  }

  static localLoad () {
    return Promise.all([
      localHorsesDB.allDocs(),
      localNotificationsDB.allDocs(),
      localRidesDB.allDocs(),
      localUsersDB.allDocs(),
    ]).then(([horsesResp, notificationsResp, ridesResp, usersResp]) => {
      const parsed = {
        horses: {},
        horsePhotos: {},
        horseUsers: {},
        follows: {},
        notifications: {},
        rideAtlasEntries: {},
        rideCarrots: {},
        rideCoordinates: {},
        rideComments: {},
        rideElevations: {},
        ridePhotos: {},
        rideHorses: {},
        rides: {},
        trainings: {},
        users: {},
        userPhotos: {},
        leaderboards: null
      }

      for (let horseDoc of horsesResp.rows) {
        if (horseDoc.doc.deleted !== true) {
          switch (horseDoc.doc.type) {
            case 'horse':
              parsed.horses[horseDoc.doc._id] = horseDoc.doc
              break
            case 'horsePhoto':
              parsed.horsePhotos[horseDoc.doc._id] = horseDoc.doc
              break
            case 'horseUser':
              parsed.horseUsers[horseDoc.doc._id] = horseDoc.doc
              break
          }
        }
      }

      for (let userDoc of usersResp.rows) {
        if (userDoc.doc.deleted !== true) {
          const doc = userDoc.doc
          const id = doc._id
          switch (userDoc.doc.type) {
            case 'follow':
              parsed.follows[id] = doc
              break
            case 'user':
              parsed.users[id] = doc
              break
            case 'userPhoto':
              parsed.userPhotos[id] = doc
              break
            case 'training':
              parsed.trainings[id] = doc
              break
            case 'leaderboards':
              parsed.leaderboards = doc
              break
          }
        }
      }

      for (let rideDoc of ridesResp.rows) {
        if (rideDoc.doc.deleted !== true) {
          const doc = rideDoc.doc
          const id = doc._id
          switch (rideDoc.doc.type) {
            case 'carrot':
              parsed.rideCarrots[id] = doc
              break
            case 'rideCoordinates':
              parsed.rideCoordinates[id] = doc
              break
            case 'comment':
              parsed.rideComments[id] = doc
              break
            case 'rideAtlasEntry':
              parsed.rideAtlasEntries[id] = doc
              break
            case 'rideElevations':
              parsed.rideElevations[id] = doc
              break
            case 'ridePhoto':
              parsed.ridePhotos[id] = doc
              break
            case 'rideHorse':
              parsed.rideHorses[id] = doc
              break
            case 'ride':
              parsed.rides[id] = doc
              break
          }
        }
      }

      for (let notificationDoc of notificationsResp.rows) {
        if (notificationDoc.deleted !== true) {
          const doc = notificationDoc.doc
          const id = doc._id
          parsed.notifications[id] = doc
        }
      }

      return parsed
    })
  }

  static loadRideCoordinates (rideID) {
    return localRidesDB.get(`${rideID}_coordinates`)
  }

  static loadRideElevations (rideID) {
    return localRidesDB.get(`${rideID}_elevations`)
  }
}
