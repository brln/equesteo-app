import { logInfo } from '../helpers'
import { captureBreadcrumb } from '../services/Sentry'
import  Mixpanel from 'react-native-mixpanel'
import { ENV } from 'react-native-dotenv'

export default logger = store => dispatch => action => {
  const toLog = {'action': action.type}
  if (action.logData) {
    for (let logItem of action.logData) {
      toLog[logItem] = action[logItem]
    }
  }

  if (action.mixpanel && ENV !== 'local') {
    Mixpanel.track(action.type, toLog)
  }

  const asString = JSON.stringify(toLog)
  logInfo(asString)
  captureBreadcrumb(asString, 'action')
  dispatch(action)
}