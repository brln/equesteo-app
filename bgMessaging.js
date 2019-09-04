import functional from './actions/functional'
import {NotConnectedError} from "./errors"

export default (store) => {
  return () => {
    return store.dispatch(functional.tryToLoadStateFromDisk()).then(() => {
      return store.dispatch(functional.doSync())
    }).then(() => {
      return store.dispatch(functional.showLocalNotifications())
    }).catch(e => {
      if (!(e instanceof NotConnectedError)) {
        functional.logError(e, 'bgMessageing.mainFunc')
      }
    })
  }
}