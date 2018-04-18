import PouchDB from 'pouchdb-react-native'


import { clearState, persisted, persistStarted, newRev } from './actions'
import { API_URL } from 'react-native-dotenv'

let queue = []
let savingLocally = false
let savingRemotely = false

function localPersist (state, rev, store) {
  const dbName = 'db' + state.userData.id.toString()
  const localDB = new PouchDB(dbName, {auto_compaction: true})
  console.log('state rev: ' + state._rev)
  console.log('putting with rev: ' + rev)
  localDB.put({...state, _rev: rev}).then((doc) => {
    if (queue.length) {
      const state = queue.shift()
      recursiveEmptyQueue(state, doc.rev, store)
    } else {
      savingLocally = false
      store.dispatch(newRev(doc.rev))
    }
    if (!savingRemotely) {
      // this will need to be a queue at some point
      remotePersist(store, state, localDB)
    }
  }).catch((e) => {
    console.log(e)
    console.log(state)
  })
}

function remotePersist (store, state, localDB) {
  if (state.needsToPersist && state.goodConnection && state.jwt) {
    savingRemotely = true
    console.log('remote persisting')
    const url = API_URL + '/couchproxy/' + localDB.name
    const remoteDB = new PouchDB(url, {ajax: {
      headers: {'Authorization': 'Bearer: ' + state.jwt}
    }})
    PouchDB.replicate(localDB, remoteDB).on('complete', (info) => {
      store.dispatch(persisted())
      if (state.clearStateAfterPersist) {
        store.dispatch(clearState())
      }
      savingRemotely = false
      console.log('done saving remotely')
    }).on('error', (e) => {
      alert('could not save to server')
      console.log(e)
    })
  }
}

function recursiveEmptyQueue (state, rev, store) {
  savingLocally = true
  localPersist(state, rev, store)
}

export const storeToPouch = store => dispatch => action => {
  console.log('starting action: ' + action.type)
  dispatch(action)
  let currentState = store.getState()
  if (currentState.userLoaded) {
    if (action.persist !== false) {
      if (savingLocally) {
        console.log('enqueueing action: ' + action.type)
        queue.push({...currentState})
      } else {
        console.log('running action: ' + action.type)
        recursiveEmptyQueue({...currentState}, currentState._rev, store)
      }
    }



  }
}