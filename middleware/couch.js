import { clearState, remotePersistComplete } from '../actions'
import { PouchCouch } from '../services/index'

let queue = []
let savingRemotely = false

export default storeToCouch = store => dispatch => action => {
  dispatch(action)
  let currentState = store.getState()
  const needsPersist = Object.values(currentState.localState.needsRemotePersist).filter((x) => x).length > 0
  if (needsPersist && currentState.localState.jwt && currentState.localState.goodConnection) {
    const pouchCouch = new PouchCouch(currentState.localState.jwt)
    for (let db of Object.keys(currentState.localState.needsRemotePersist)) {
      if (currentState.localState.needsRemotePersist[db]) {
        if (savingRemotely) {
          queue.push(db)
        } else {
          recursiveEmptyQueue(db, store, pouchCouch)
        }
      }
    }
  } else if (!needsPersist && currentState.localState.clearStateAfterPersist) {
    store.dispatch(clearState())
  }
}

function recursiveEmptyQueue (db, store, pouchCouch) {
  savingRemotely = true
  remotePersist(db, store, pouchCouch)
}

function remotePersist (db, store, pouchCouch) {
  pouchCouch.remoteReplicateDB(db).on('complete', () => {
    if (queue.length) {
      const db = queue.shift()
      recursiveEmptyQueue(db, store, pouchCouch)
    } else {
      store.dispatch(remotePersistComplete(db))
      savingRemotely = false
      if (store.getState().localState.clearStateAfterPersist) {
        store.dispatch(clearState())
      }
    }
  }).on('error', (e) => {
    queue = []
    savingRemotely = false
    console.log('Remote replication error follows: ')
    console.log(e)
  })
}

