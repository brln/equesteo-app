import { logDebug, logError } from '../helpers'
import LocalStorage from '../services/LocalStorage'

let lastLocalStateHash = null
let lastCurrentRideHash = null

export default storeLocalState = store => dispatch => action => {
  dispatch(action)
  const localState = store.getState().get('localState')
  let newHash = localState.hashCode()
  if (newHash !== lastLocalStateHash) {
    LocalStorage.saveLocalState(localState.toJS()).catch(e => {logError(e, 'LocalStorage.saveLocalState1')})
    lastLocalStateHash = newHash
  }

  const currentRideState = store.getState().get('currentRide')
  let newCRHash = currentRideState.hashCode()
  if (newCRHash !== lastCurrentRideHash) {
    LocalStorage.saveCurrentRideState(currentRideState.toJS()).catch(e => {logError(e, 'LocalStorage.saveLocalState2')})
    lastCurrentRideHash = newCRHash
  }
}
