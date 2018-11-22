import {
  remotePersistComplete,
  remotePersistError,
  remotePersistStarted
} from '../actions/functional'
import {
  clearState,
} from '../actions/standard'
import { logError } from '../helpers'
import { PouchCouch } from '../services/index'
import { captureException } from '../services/Sentry'

let queue = []
let savingRemotely = false
let currentlySavingDB = null

function addToQueue (db) {
  if (currentlySavingDB !== db && queue.indexOf(db) < 0) {
    queue.push(db)
  }
}

export default storeToCouch = store => dispatch => action => {
  dispatch(action)
  const localState = store.getState().get('localState')
  const needsPersist = localState.get('needsRemotePersist')
  const needsAnyPersist = needsPersist.valueSeq().filter(x => x).count() > 0
  const jwt = localState.get('jwt')
  const goodConnection = localState.get('goodConnection')
  const clearStateAfterPersist = localState.get('clearStateAfterPersist')
  if (needsAnyPersist && jwt && goodConnection) {
    const pouchCouch = new PouchCouch(jwt)
    for (let db of needsPersist.keySeq()) {
      if (needsPersist.get(db)) {
        if (savingRemotely) {
          addToQueue(db)
        } else {
          recursiveEmptyQueue(db, store, pouchCouch)
        }
      }
    }
  } else if (!needsAnyPersist && clearStateAfterPersist) {
    store.dispatch(clearState())
  }
}

function recursiveEmptyQueue (db, store, pouchCouch) {
  savingRemotely = true
  remotePersist(db, store, pouchCouch)
}

function remotePersist (db, store, pouchCouch) {
  const knowsAboutPersist = store.getState().getIn(['localState', 'remotePersistActive'])
  if (!knowsAboutPersist) {
    store.dispatch(remotePersistStarted())
  }
  currentlySavingDB = db
  pouchCouch.remoteReplicateDB(db).on('complete', () => {
    currentlySavingDB = null
    if (queue.length) {
      const db = queue.shift()
      recursiveEmptyQueue(db, store, pouchCouch)
    } else {
      store.dispatch(remotePersistComplete(db))
      savingRemotely = false
      const clear = store.getState().getIn(['localState', 'clearStateAfterPersist'])
      if (clear) {
        store.dispatch(clearState())
      }
    }
  }).on('error', (e) => {
    currentlySavingDB = null
    const knowsAboutError = store.getState().getIn(['localState', 'remotePersistError'])
    if (!knowsAboutError) {
      store.dispatch(remotePersistError())
    }
    if (e.code !== 'ETIMEDOUT') {
      captureException(e)
      logError('Remote replication error follows ============================')
      logError(e)
      logError('=============================================================')

      queue = []
      savingRemotely = false
    } else {
      logError('Request timed out')
    }
  })
}

