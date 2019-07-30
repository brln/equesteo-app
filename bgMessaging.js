import { tryToLoadStateFromDisk } from "./actions/helpers"
import { logError } from './helpers'
import functional from './actions/functional'

export default (store) => {
  return () => {
    return tryToLoadStateFromDisk(store.dispatch).then(() => {
      return store.dispatch(functional.doSync())
    }).then(() => {
      return store.dispatch(functional.showLocalNotifications())
    }).catch(e => {
      logError(e, 'bgMessageing.mainFunc')
    })
  }
}