import { clearState, persisted, persistStarted, newRev } from './actions'
import PouchCouch from './services/pouch_couch'

let queue = []
let savingLocally = false
let savingRemotely = false

function localPersist (state, rev, store, pouchCouch) {
  pouchCouch.localPut({...state, _rev: rev}).then((doc) => {
    if (queue.length) {
      const state = queue.shift()
      recursiveEmptyQueue(state, doc.rev, store, pouchCouch)
    } else {
      savingLocally = false
      store.dispatch(newRev(doc.rev))
    }
    if (!savingRemotely) {
      if (state.needsToPersist && state.goodConnection && state.jwt) {
        remotePersist(store, state, pouchCouch)
      }
    }
  }).catch((e) => {
    console.log(e)
    console.log(state)
  })
}

function remotePersist (store, state, pouchCouch) {
  savingRemotely = true
  pouchCouch.remoteReplicate().on('complete', (info) => {
    store.dispatch(persisted())
    if (state.clearStateAfterPersist) {
      store.dispatch(clearState())
    }
    savingRemotely = false
  }).on('error', (e) => {
    alert('could not save to server')
  })
}

function recursiveEmptyQueue (state, rev, store, pouchCouch) {
  savingLocally = true
  localPersist(state, rev, store, pouchCouch)
}

export const storeToPouch = store => dispatch => action => {
  dispatch(action)
  let currentState = store.getState()
  if (currentState.userLoaded) {
    if (action.persist !== false) {
      const pouchCouch = new PouchCouch(currentState.userData.id, currentState.jwt)
      if (savingLocally) {
        queue.push({...currentState})
      } else {
        recursiveEmptyQueue({...currentState}, currentState._rev, store, pouchCouch)
      }
    }
  }
}