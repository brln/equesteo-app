
import  Mixpanel from 'react-native-mixpanel'

import { MIXPANEL_TOKEN } from './dotEnv'
import { tryToLoadStateFromDisk } from "./actions/helpers"
import { doSync, showLocalNotifications } from './actions/functional'

export default (store) => {
  return (m) => {
    return Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN).then(() => {
      return tryToLoadStateFromDisk(store.dispatch)
    }).then(() => {
      return store.dispatch(doSync())
    }).then(() => {
      return store.dispatch(showLocalNotifications())
    })
  }
}