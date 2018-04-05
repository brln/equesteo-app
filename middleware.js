import PouchDB from 'pouchdb-react-native'

export const storeToPouch = store => next => action => {
  let result = next(action)
  if (store.getState().userLoaded) {
    const dbName = store.getState().userData.id.toString()
    const localDB = new PouchDB(dbName)
    localDB.get('state').then((doc) => {
      const newLocalState = {
        ...store.getState(),
        _rev: doc._rev,
        _id: 'state'
      }
      localDB.put(newLocalState)
    }).catch((e) => {
      if (e.status === 404) {
        localDB.put({
          ...store.getState(),
          _id: 'state'
        })
      } else {
        throw e
      }
    })
    return result
  }
}