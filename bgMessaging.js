
import  Mixpanel from 'react-native-mixpanel'

import { handleNotification } from './services/PushNotificationHandler'
import { MIXPANEL_TOKEN } from './dotEnv'
import {tryToLoadStateFromDisk} from "./actions/helpers"

export default (store) => {
  return (m) => {
    console.log("STARTING BG MESSAGING FUNCTION")
    return Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN).then(() => {
      return tryToLoadStateFromDisk(store.dispatch)
    }).then(() => {
      handleNotification(store.dispatch, m.data, true)
    })
  }
}