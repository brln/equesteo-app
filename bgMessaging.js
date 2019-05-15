import { tryToLoadStateFromDisk } from "./actions/helpers"
import { doSync, showLocalNotifications } from './actions/functional'

export default (store) => {
  return () => {
    return tryToLoadStateFromDisk(store.dispatch).then(() => {
      return store.dispatch(doSync())
    }).then(() => {
      return store.dispatch(showLocalNotifications())
    })
  }
}