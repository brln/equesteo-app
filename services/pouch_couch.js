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

  remoteReplicateHorses () {
    return PouchDB.replicate(this.localHorsesDB, this.remoteHorsesDB)
  }

  remoteReplicateRides () {
    return PouchDB.replicate(this.localRidesDB, this.remoteRidesDB)
  }

  remoteReplicateUsers () {
    return PouchDB.replicate(this.localUsersDB, this.remoteUsersDB)
  }

  localReplicateDB(db, userIDs) {
    switch(db) {
      case 'horses':
        return this.localReplicateHorses(userIDs)
      case 'rides':
        return this.localReplicateRides(userIDs)
      case 'users':
        return this.localReplicateUsers(userIDs)
      case 'all':
        return this.localReplicate(userIDs)
      default:
        throw('Local DB not found')
    }
  }

  localReplicateRides (userIDs) {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteRidesDB,
        this.localRidesDB,
        {
          live: false,
          filter: 'rides/byUserIDs',
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

  localReplicateUsers (userIDs) {
    return new Promise((resolve, reject) => {
      PouchDB.replicate(
        this.remoteUsersDB,
        this.localUsersDB,
        {
          doc_ids: userIDs
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

  localReplicate (userIDs) {
    const rideReplicate = this.localReplicateRides(userIDs)
    const userReplicate = this.localReplicateUsers(userIDs)
    const horsesReplicate = this.localReplicateHorses(userIDs)
    return Promise.all([rideReplicate, horsesReplicate, userReplicate])
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
    return {
      horses: horsesResp.rows.map((r) => r.doc),
      rideCarrots: ridesResp.rows.map((r) => r.doc).filter((r) => r.type === 'carrot'),
      rides: ridesResp.rows.map((r) => r.doc).filter((r) => r.type === 'ride'),
      users: usersResp.rows.map((r) => r.doc),
    }
  }
}