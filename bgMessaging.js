import { logError } from './helpers'
import functional from './actions/functional'

export default (store) => {
  return () => {
    return store.dispatch(functional.tryToLoadStateFromDisk()).then(() => {
      return store.dispatch(functional.doSync())
    }).then(() => {
      return store.dispatch(functional.showLocalNotifications())
    }).catch(e => {
      logError(e, 'bgMessageing.mainFunc')
    })
  }
}