import { Sentry } from 'react-native-sentry'
import { logInfo } from '../helpers'

export default logger = store => dispatch => action => {
  const toLog = {'action': action.type}
  if (action.logData) {
    for (let logItem of action.logData) {
      toLog[logItem] = action[logItem]
    }
  }
  const asString = JSON.stringify(toLog)
  logInfo(asString)
  Sentry.captureBreadcrumb(
    {
      message: asString,
      category: 'action',
    }
  )
  dispatch(action)
}