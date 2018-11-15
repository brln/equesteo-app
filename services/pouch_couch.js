import PouchDB from 'pouchdb-react-native'
import { API_URL } from 'react-native-dotenv'
import { captureException } from '../services/Sentry'


import { logInfo, logError } from '../helpers'

export default class PouchCouch {
  constructor (jwt) {
    const horsesDBName = 'horses'
    const ridesDBName = 'rides'
    const usersDBName = 'users'
    this.localHorsesDB = new PouchDB(horsesDBName)
    this.localRidesDB = new PouchDB(ridesDBName)
    this.localUsersDB = new PouchDB(usersDBName)

    const remoteHeaders = {
      ajax: {
        headers: {'Authorization': 'Bearer: ' + jwt}
      }
    }
    this.remoteHorsesDB = new PouchDB(`${API_URL}/couchproxy/${horsesDBName}`, remoteHeaders)
    this.remoteRidesDB = new PouchDB(`${API_URL}/couchproxy/${ridesDBName}`, remoteHeaders)
    this.remoteUsersDB = new PouchDB(`${API_URL}/couchproxy/${usersDBName}`, remoteHeaders)
  }

  catchError (e) {
    logInfo("ERROR TO FOLLOW: ")
    logError(e)
    captureException(e)
    throw e
  }

  saveHorse (horseData) {
    return this.localHorsesDB.put(horseData).catch((e) => {
      logInfo('error saving horse')
      this.catchError(e)
    })
  }

  saveRide (rideData) {
    return this.localRidesDB.put(rideData)
  }


  saveUser (userData) {
    return this.localUsersDB.put(userData).catch((e) => {
      logInfo('error saving user')
      this.catchError(e)
    })
  }

  deleteRide (id, rev) {
    return this.localRidesDB.remove(id, rev).catch((e) => {
      logInfo('error deleting ride')
      this.catchError(e)
    })
  }

  remoteReplicateDB(db) {
    switch(db) {
      case 'horses':
        return this.remoteReplicateHorses()
      case 'rides':
        return this.remoteReplicateRides()
      case 'users':
        return this.remoteReplicateUsers()
      default:
        throw('Remote DB not found')
    }
  }

  // --START MESSAGE
  // Do not put error handlers on these, the errors are handled in
  // middleware/couch.js::remotePersist and if you catch them here
  // it fucks the queue up
  remoteReplicateHorses () {
    return PouchDB.replicate(this.localHorsesDB, this.remoteHorsesDB)
  }

  remoteReplicateRides () {
    return PouchDB.replicate(this.localRidesDB, this.remoteRidesDB)
  }

  remoteReplicateUsers () {
    return PouchDB.replicate(this.localUsersDB, this.remoteUsersDB)
  }
  // ---END MESSAGE

  localReplicateDB(db, userIDs, followerUserIDs) {
    switch(db) {
      case 'horses':
        return this.localReplicateHorses([...userIDs, ...followerUserIDs]).catch(e => {})
      case 'rides':
        return this.localReplicateRides(userIDs, followerUserIDs).catch(e => {})
      case 'users':
        return this.localReplicateUsers([...userIDs, ...followerUserIDs]).catch(e => {})
      case 'all':
        const rideReplicate = this.localReplicateRides(userIDs, followerUserIDs)
        const userReplicate = this.localReplicateUsers([...userIDs, ...followerUserIDs])
        const horsesReplicate = this.localReplicateHorses([...userIDs, ...followerUserIDs])
        return Promise.all([rideReplicate, horsesReplicate, userReplicate])
      default:
        throw('Local DB not found')
    }
  }

  localReplicateRides (userIDs, followerUserIDs) {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteRidesDB,
        this.localRidesDB,
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
        logError('localReplicateRides')
        logError(e)
        reject()
      })
    })
  }

  localReplicateUsers () {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteUsersDB,
        this.localUsersDB,
        {
          live: false,
        }
      ).on('complete', () => {
          resolve()
      }).on('error', (e) => {
        logError('localReplicateUsers')
        logError(e)
        reject()
      })
    })
  }

  localReplicateHorses (userIDs) {
    return new Promise((resolve, reject) => {
      this.remoteHorsesDB.query('horses/allJoins', {}).then((resp) => {
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
        PouchDB.replicate(
          this.remoteHorsesDB,
          this.localHorsesDB,
          {
            live: false,
            doc_ids: fetchIDs,
          }
        ).on('complete', () => {
          resolve()
        }).on('error', (e) => {
          logError('localReplicateHorses')
          logError(e)
          reject()
        })
      }).catch((e) => {
        logError('localReplicateHorses allJoins error')
        logError(e)
        reject()
      })
    })
  }

  async deleteLocalDBs () {
    logInfo('deleting all local DBs')
    await this.localHorsesDB.destroy()
    await this.localUsersDB.destroy()
    await this.localRidesDB.destroy()
  }

  async localLoad () {
    async function allDocs () {
      const promises = [
        this.localHorsesDB.allDocs(),
        this.localRidesDB.allDocs(),
        this.localUsersDB.allDocs(),
      ]
      return Promise.all(promises)
    }
    [ horsesResp, ridesResp, usersResp ] = await allDocs.bind(this)()
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
      rides: rideDocs.filter(r => r.type === 'ride'),
      users: userDocs.filter(u => u.type === 'user'),
      userPhotos: userDocs.filter(u => u.type === 'userPhoto')
    }
  }

  async loadRideCoordinates (rideID) {
    return this.localRidesDB.get(`${rideID}_coordinates`).catch(e => this.catchError(e))
  }
}