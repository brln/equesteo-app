import LocalStorage from '../services/local_storage'

let lastLocalStateHash = null

export default storeLocalState = store => dispatch => action => {
  dispatch(action)
  const localState = store.getState().get('localState')
  let newHash = localState.hashCode()
  if (newHash !== lastLocalStateHash) {
    LocalStorage.saveLocalState(localState.toJS())
    lastLocalStateHash = newHash
  }
}
