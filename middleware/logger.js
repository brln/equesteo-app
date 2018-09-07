import { Sentry } from 'react-native-sentry'

export default logger = store => dispatch => action => {
  const toLog = {'action': action.type}
  if (action.logData) {
    for (let logItem of action.logData) {
      toLog[logItem] = action[logItem]
    }
  }
  const asString = JSON.stringify(toLog)
  console.log(asString)
  Sentry.captureBreadcrumb(
    {
      message: asString,
      category: 'action',
    }
  )
  dispatch(action)
}