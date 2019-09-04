import { Alert } from 'react-native'
import { Sentry } from 'react-native-sentry'
import  config from '../dotEnv'


export function setUserContext(userID) {
  if (config.ENV !== 'local') {
    Sentry.setUserContext({
      id: userID,
    });
  }
}

export function captureMessage (m) {
  if (config.ENV !== 'local') {
    Sentry.captureMessage(m)
  } else {
    Alert.alert('see logs, sentry message captured')
  }
}

export function captureException (e) {
  console.log(config.ENV)
  if (config.ENV !== 'local') {
    try {
      if (e) {
        if (e.stacktrace) {
          Sentry.captureException(e)
        } else if (typeof e === 'object') {
          Sentry.captureException(new Error(JSON.stringify(e)))
        } else {
          Sentry.captureException(new Error(e.toString()))
        }
      }
    } catch (e) {
      Sentry.captureBreadcrumb('Cannot capture exception')
      Sentry.captureException(e)
    }
  } else {
    Alert.alert('see logs, sentry exception captured')
  }
}

export function configure () {
  if (config.ENV !== 'local') {
    Sentry.config(config.SENTRY_DSN).install()
    Sentry.setRelease(config.RELEASE)
    Sentry.setDist(config.DISTRIBUTION)
  }
}

export function captureBreadcrumb (message, category, data) {
  if (config.ENV !== 'local') {
    const bcData = { message, category }
    if (data) {
      bcData[data] = data
    }
    Sentry.captureBreadcrumb(bcData)
  }
}
