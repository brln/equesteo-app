import PouchDB from 'pouchdb-react-native'

import { persisted, persistStarted, newRev } from './actions'
import { NEW_REV } from './constants'
import { UserAPI } from './services'

let queue = []
let awaitingResponse = false

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
      awaitingResponse = false
      store.dispatch(newRev(doc.rev))
    }
  }).catch((e) => {
    if (e.status === 404) {
      localDB.put(state).catch((e) => {
        console.log(e)
      })
    } else {
      console.log(e)
      console.log(state)
      throw e
    }
  })
}

function remotePersist (store, state) {
  if (state.needsToPersist && !state.persistStarted && state.goodConnection && state.jwt) {
    console.log('remote persisting')
    const persistState = {...state}
    delete persistState.jwt
    delete persistState._id
    delete persistState._rev

    const userAPI = new UserAPI(state.jwt)
    store.dispatch(persistStarted())
    userAPI.saveState(persistState).then(() => {
      store.dispatch(persisted())
    }).catch((e) => {
      alert('could not save to server')
    })
  }
}

function recursiveEmptyQueue (state, rev, store) {
  awaitingResponse = true
  localPersist(state, rev, store)
}

export const storeToPouch = store => dispatch => action => {
  console.log('starting action: ' + action.type)
  dispatch(action)
  let currentState = store.getState()
  if (currentState.userLoaded) {
    if (action.persist !== false) {
      if (awaitingResponse) {
        console.log('enqueueing action: ' + action.type)
        queue.push({...currentState})
      } else {
        console.log('running action: ' + action.type)
        recursiveEmptyQueue({...currentState}, currentState._rev, store)
      }
    }
    remotePersist(store, currentState)
  }
}