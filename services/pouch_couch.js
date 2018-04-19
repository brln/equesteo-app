import PouchDB from 'pouchdb-react-native'
import { API_URL } from 'react-native-dotenv'

export default class PouchCouch {
  constructor (userID, jwt) {
    const dbName = 'db' + userID.toString()
    this.localDB = new PouchDB(dbName, {auto_compaction: true})
    this.remoteDB = new PouchDB(`${API_URL}/couchproxy/${dbName}`, {ajax: {
      headers: {'Authorization': 'Bearer: ' + jwt}
    }})
  }

  localPut (data) {
    return this.localDB.put(data)
  }

  remoteReplicate () {
    return PouchDB.replicate(this.localDB, this.remoteDB)
  }
}