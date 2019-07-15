import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from '../dotEnv'

import { logError, logInfo } from '../helpers'

export function setUserContext(userID) {
  if (ENV !== 'local') {
    Sentry.setUserContext({
      id: userID,
    });
  }
}

export function captureMessage (m) {
  if (ENV !== 'local') {
    Sentry.captureMessage(m)
  } else {
    alert('see logs, sentry message captured')
    logInfo(m, 'Sentry message captured')
  }
}

export function captureException (e) {
  if (ENV !== 'local') {
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
      logError(e, 'Sentry.captureException')
      Sentry.captureBreadcrumb('Cannot capture exception')
      Sentry.captureException(e)
    }
  } else {
    alert('see logs, sentry exception captured')
    logInfo(e, 'Sentry exception captured')
  }
}

export function configure () {
  if (ENV !== 'local') {
    Sentry.config(SENTRY_DSN).install()
    Sentry.setRelease(RELEASE)
    Sentry.setDist(DISTRIBUTION)
  }
}

export function captureBreadcrumb (message, category, data) {
  if (ENV !== 'local') {
    const bcData = { message, category }
    if (data) {
      bcData[data] = data
    }
    Sentry.captureBreadcrumb(bcData)
  }
}
