import PouchDB from 'pouchdb-react-native'

import { clearState, persisted, persistStarted, newRev } from './actions'
import { UserAPI } from './services'

let queue = []
let savingLocally = false
let savingRemotely = false

function localPersist (state, rev, store) {
  const dbName = state.userData.id.toString()
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
  }).catch((e) => {
    console.log(e)
    console.log(state)
  })
}

function remotePersist (store, state) {
  if (state.needsToPersist && state.goodConnection && state.jwt) {
    savingRemotely = true
    console.log('remote persisting')
    const persistState = {...state}
    delete persistState.jwt
    delete persistState._id
    delete persistState._rev

    const userAPI = new UserAPI(state.jwt)
    userAPI.saveState(persistState).then(() => {
      store.dispatch(persisted())
      if (state.clearStateAfterPersist) {
        store.dispatch(clearState())
      }
      savingRemotely = false
      console.log('done saving remotely')
    }).catch((e) => {
      alert('could not save to server')
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

    if (!savingRemotely) {
      // this will need to be a queue at some point
      remotePersist(store, currentState)
    }

  }
}