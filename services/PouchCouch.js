import PouchDB from 'pouchdb-react-native'

import config from '../dotEnv'
import { NotConnectedError } from "../errors"
import ApiClient from './ApiClient'

import { END_OF_FEED } from '../containers/Feed/Feed'

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
      if (e.status === 0 || e.status === 502 || e.status === 504) {
        reject(new NotConnectedError('Cannot find the database'))
      } else {
        reject(e)
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
        remote: `${config.API_URL}/couchproxy/${horsesDBName}`
      },
      {
        local: localRidesDB,
        remote: `${config.API_URL}/couchproxy/${ridesDBName}`
      },
      {
        local: localUsersDB,
        remote: `${config.API_URL}/couchproxy/${usersDBName}`
      },
      {
        local: localNotificationsDB,
        remote: `${config.API_URL}/couchproxy/${notificationsDBName}`
      }
    ]
    return PouchCouch.preReplicate().then(options => {
      const replications = []
      for (let db of dbs) {
        const remoteDB = new PouchDB(db.remote, options)
        replications.push(
          new Promise((res, rej) => {
            PouchDB.replicate(db.local, remoteDB, { batchSize: 1000 }).on('complete', (resp) => {
              res(resp)
            }).on(
              'error', PouchCouch.errorHandler(rej)
            ).on(
              'denied', PouchCouch.errorHandler(rej)
            )
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

  static localReplicateDBs (ownUserID, followingUserIDs, followerUserIDs, progress, lastSync) {
    let options
    return PouchCouch.preReplicate().then(_options => {
      options = _options
      return PouchCouch.getLeaderboardIDs(options)
    }).then((leaderboardIDs) => {
      return Promise.all([
        PouchCouch.localReplicateRides(options, ownUserID, [ownUserID, ...followingUserIDs], progress, lastSync),
        PouchCouch.localReplicateHorses(options, [ownUserID, ...followingUserIDs, ...followerUserIDs, ...leaderboardIDs], progress),
        PouchCouch.localReplicateUsers(options, ownUserID, leaderboardIDs, progress),
        PouchCouch.localReplicateNotifications(options, ownUserID, progress),
      ])
    }).then(() => {
      return PouchCouch.postReplicate()
    })
  }

  static getLeaderboardIDs (options) {
    const remoteUsersDB = new PouchDB(`${config.API_URL}/couchproxy/${usersDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteUsersDB.query('users/leaderboardUsers').then((resp) => {
        const userIDs = resp.rows.map(r => r.key)
        resolve(userIDs)
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateRides (options, ownUserID, userIDs, progress, lastSync) {
    const rideIDs = {}
    const allDocIDs = {}

    const remoteRidesDB = new PouchDB(`${config.API_URL}/couchproxy/${ridesDBName}`, options)
    return new Promise((resolve, reject) => {
      return remoteRidesDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        return remoteRidesDB.query('rides/ridesByTimestamp', {keys: userIDs})
      }).then(resp => {
        // This has to pull all the way until end of feed, not just since last sync,
        // because otherwise when you start following someone new it doesn't pull all their
        // recent rides.
        const pullAfter = END_OF_FEED
        resp.rows.map(row => {
          if (row.value > pullAfter) {
            rideIDs[row.id] = 0
          }
        })
        return localRidesDB.allDocs({ include_docs: false })
      }).then(allLocalDocs => {
        allLocalDocs.rows.reduce((a, d) => {
          a[d.id] = 0
          return a
        }, rideIDs)
        return remoteRidesDB.query('rides/rideJoins', {keys: Object.keys(rideIDs)})
      }).then(resp => {
        resp.rows.map(row => {
          allDocIDs[row.id] = 0
        })
        return remoteRidesDB.query('rides/atlasEntryDocIDs', {key: ownUserID})
      }).then((resp3) => {
        resp3.rows.map(row => {
          allDocIDs[row.id] = 0
        })
        PouchDB.replicate(
          remoteRidesDB,
          localRidesDB,
          {
            batch_size: 1000,
            live: false,
            doc_ids: Object.keys(allDocIDs)
          }
        ).on('complete', info => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'rides')
          resolve()
        }).on('change', (info) => {
          const docs = parseInt(info.last_seq.split('-')[0])
          progress.doneDocsFunc(docs, 'rides')
        }).on('error', PouchCouch.errorHandler(reject))
      }).catch(PouchCouch.errorHandler(reject))
    })
  }

  static localReplicateRide (rideID) {
    const allDocIDs = {}
    return PouchCouch.preReplicate().then(options => {
      return new Promise((resolve, reject) => {
        const remoteRidesDB = new PouchDB(`${config.API_URL}/couchproxy/${ridesDBName}`, options)
        remoteRidesDB.query('rides/rideJoins', {key: rideID}).then(resp => {
          resp.rows.map(row => {
            allDocIDs[row.id] = 0
          })
          PouchDB.replicate(
            remoteRidesDB,
            localRidesDB,
            {
              batch_size: 1000,
              live: false,
              doc_ids: Object.keys(allDocIDs)
            }
          ).on('complete', () => {
            resolve(resp)
          }).on('error', PouchCouch.errorHandler(reject))
        })
      })
    }).then(() => {
      return PouchCouch.postReplicate()
    })
  }


  static localReplicateNotifications (options, ownUserID, progress) {
    const remoteNotificationsDB = new PouchDB(`${config.API_URL}/couchproxy/${notificationsDBName}`, options)
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

  static localReplicateUsers (options, ownUserID, leaderboardIDs, progress) {
    const remoteUsersDB = new PouchDB(`${config.API_URL}/couchproxy/${usersDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteUsersDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        let fetchUserIDs = {}
        fetchUserIDs[ownUserID] = 0
        return remoteUsersDB.query('users/relevantFollows', {key: ownUserID}).then((resp) => {
          // First degree follower/following
          resp.rows.reduce((accum, row) => {
            if (row.value[0] !== config.NICOLE_USER_ID) {
              accum[row.value[0]] = 0
            } else if (row.value[0] === config.NICOLE_USER_ID && ownUserID === config.NICOLE_USER_ID) {
              accum[row.value[0]] = 0
            }
            return accum
          }, fetchUserIDs)
          return remoteUsersDB.query('users/relevantFollows', {keys: Object.keys(fetchUserIDs)})
        }).then(resp2 => {
          // Second degree follower/following
          resp2.rows.reduce((accum, row) => {
            accum[row.value[0]] = 0
            return accum
          }, fetchUserIDs)
          for (let leaderboardID of leaderboardIDs) {
            fetchUserIDs[leaderboardID] = 0
          }
          fetchUserIDs[config.NICOLE_USER_ID] = 0
          return remoteUsersDB.query('users/userDocIDs', {keys: Object.keys(fetchUserIDs)})
        }).then(resp3 => {
          const allDocIDs = {}
          allDocIDs['leaderboards'] = 0
          resp3.rows.reduce((accum, row) => {
            accum[row.id] = 0
            return accum
          }, allDocIDs)
          return PouchDB.replicate(
            remoteUsersDB,
            localUsersDB,
            {
              batch_size: 1000,
              live: false,
              doc_ids: Object.keys(allDocIDs)
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
    const remoteHorsesDB = new PouchDB(`${config.API_URL}/couchproxy/${horsesDBName}`, options)
    return new Promise((resolve, reject) => {
      remoteHorsesDB.info().then(resp => {
        const docs = parseInt(resp.update_seq.split('-')[0])
        progress.moreDocsFunc(docs)
        return remoteHorsesDB.query('horses/allJoins2', {keys: userIDs}).then((resp) => {
          const fetchIDs = []
          for (let row of resp.rows) {
            const joinID = row.id
            const userID = row.key
            const joinedID = row.value
            if (userIDs.indexOf(userID) >= 0) {
              fetchIDs.push(joinID)
              if (fetchIDs.indexOf(joinedID) < 0) {
                fetchIDs.push(joinedID)
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
        careEvents: {},
        horseCareEvents: {},
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

      // Don't filter these for deleted because then you have docs in your
      // db that aren't in your state, and if you re-create them (i.e. new follow)
      // and try to save you'll get a conflict.
      for (let horseDoc of horsesResp.rows) {
        switch (horseDoc.doc.type) {
          case 'careEvent':
            parsed.careEvents[horseDoc.doc._id] = horseDoc.doc
            break
          case 'horse':
            parsed.horses[horseDoc.doc._id] = horseDoc.doc
            break
          case 'horseCareEvent':
            parsed.horseCareEvents[horseDoc.doc._id] = horseDoc.doc
            break
          case 'horsePhoto':
            parsed.horsePhotos[horseDoc.doc._id] = horseDoc.doc
            break
          case 'horseUser':
            parsed.horseUsers[horseDoc.doc._id] = horseDoc.doc
            break
        }
      }

      for (let userDoc of usersResp.rows) {
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

      for (let rideDoc of ridesResp.rows) {
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
