import PouchDB from 'pouchdb-react-native'

import { persisted, persistStarted, newRev } from './actions'
import { NEW_REV } from './constants'
import { UserAPI } from './services'

let queue = []
let awaitingResponse = false

function localPersist (store, state) {
  const dbName = state.userData.id.toString()
  const localDB = new PouchDB(dbName, {auto_compaction: true})
  localDB.put(state).then((doc) => {
    store.dispatch(newRev(doc.rev))
    const newState = store.getState()
    if (queue.length) {
      const store = queue.shift()
      recursiveEmptyQueue(store, {...newState})
    } else {
      awaitingResponse = false
    }
  }).catch((e) => {
    if (e.status === 404) {
      localDB.put(state).catch((e) => {
        debugger
      })
    } else {
      debugger
      throw e
    }
  })
}

function remotePersist (store, state) {
  if (state.needsToPersist && !state.persistStarted && state.goodConnection) {
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

function recursiveEmptyQueue (store, state) {
  awaitingResponse = true
  localPersist(store, state)
}

export const storeToPouch = store => dispatch => action => {
  dispatch(action)
  console.log(action)
  let currentState = store.getState()
  if (currentState.userLoaded) {
    if (action.type !== NEW_REV) {
      if (awaitingResponse) {
        queue.push(store)
      } else {
        recursiveEmptyQueue(store ,{...currentState})
      }
    }
    remotePersist(store, currentState)
  }
}