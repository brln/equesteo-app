import { tryToLoadStateFromDisk } from "./actions/helpers"
import { logError } from './helpers'
import { doSync, showLocalNotifications } from './actions/functional'

export default (store) => {
  return () => {
    return tryToLoadStateFromDisk(store.dispatch).then(() => {
      return store.dispatch(doSync())
    }).then(() => {
      return store.dispatch(showLocalNotifications())
    }).catch(e => {
      logError(e)
    })
  }
}