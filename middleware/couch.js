import { clearState, remotePersistComplete } from '../actions'
import { logInfo, logError } from '../helpers'
import { PouchCouch } from '../services/index'
import { Sentry } from 'react-native-sentry'

let queue = []
let savingRemotely = false

export default storeToCouch = store => dispatch => action => {
  dispatch(action)
  const currentState = store.getState().get('main')
  const localState = currentState.get('localState')
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
          queue.push(db)
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
  pouchCouch.remoteReplicateDB(db).on('complete', () => {
    if (queue.length) {
      const db = queue.shift()
      recursiveEmptyQueue(db, store, pouchCouch)
    } else {
      store.dispatch(remotePersistComplete(db))
      savingRemotely = false
      const clear = store.getState().getIn(['main', 'localState', 'clearStateAfterPersist'])
      if (clear) {
        store.dispatch(clearState())
      }
    }
  }).on('error', (e) => {
    Sentry.captureException(e)
    queue = []
    savingRemotely = false
    logInfo('Remote replication error follows: ')
    logError(e)
  })
}

