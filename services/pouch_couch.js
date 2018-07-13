import PouchDB from 'pouchdb-react-native'
import { API_URL } from 'react-native-dotenv'


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
    console.log("ERROR TO FOLLOW: ")
    console.log(e)
    debugger
    throw e
  }

  replicateOwnUser (id) {
    return this.localReplicateUsers([id])
  }

  saveHorse (horseData) {
    return this.localHorsesDB.put(horseData).catch(this.catchError)
  }

  saveRide (rideData) {
    return this.localRidesDB.put(rideData).catch(this.catchError)
  }

  saveUser (userData) {
    return this.localUsersDB.put(userData).catch(this.catchError)
  }

  deleteRide (id, rev) {
    return this.localRidesDB.remove(id, rev).catch(this.catchError)
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
        debugger
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
        return this.localReplicateHorses(userIDs)
      case 'rides':
        return this.localReplicateRides(userIDs, followerUserIDs)
      case 'users':
        return this.localReplicateUsers(userIDs)
      case 'all':
        const rideReplicate = this.localReplicateRides(userIDs, followerUserIDs)
        const userReplicate = this.localReplicateUsers(userIDs)
        const horsesReplicate = this.localReplicateHorses(userIDs)
        return Promise.all([rideReplicate, horsesReplicate, userReplicate])
      default:
        throw('Local DB not found')
    }
  }

  localReplicate (userIDs, followerUserIDs) {

  }

  localReplicateRides (userIDs, followerUserIDs) {
    console.log('piggy: ' + followerUserIDs)
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
        console.log(e)
        reject()
      })
    })
  }

  localReplicateUsers (userIDs) {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteUsersDB,
        this.localUsersDB,
        {
          live: false,
          filter: 'users/byUserIDs',
          query_params: {userIDs: userIDs.join(',')}
        }
      ).on('complete', () => {
          resolve()
      }).on('error', (e) => {
        console.log(e)
        reject()
      })
    })
  }

  localReplicateHorses (userIDs) {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteHorsesDB,
        this.localHorsesDB,
        {
          live: false,
          filter: 'horses/byUserIDs',
          query_params: {userIDs: userIDs.join(',')}
        }
      ).on('complete', () => {
        resolve()
      }).on('error', (e) => {
        console.log(e)
        reject()
      })
    })
  }



  async deleteLocalDBs () {
    await this.localHorsesDB.destroy()
    await this.localUsersDB.destroy()
    await this.localRidesDB.destroy()
  }

  async localLoad () {
    // @TODO: these can be called async instead of sequentially
    const horsesResp = await this.localHorsesDB.allDocs()
    const ridesResp = await this.localRidesDB.allDocs()
    const usersResp = await this.localUsersDB.allDocs()

    const rideDocs = ridesResp.rows.map(r => r.doc)
    const userDocs = usersResp.rows.map(u => u.doc)
    return {
      horses: horsesResp.rows.map(r => r.doc),
      follows: userDocs.filter(u => u.type === 'follow'),
      rideCarrots: rideDocs.filter(r => r.type === 'carrot'),
      rideComments: rideDocs.filter(r => r.type === 'comment'),
      rides: rideDocs.filter(r => r.type === 'ride'),
      users: userDocs.filter(u => u.type === 'user')
    }
  }
}