import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from '../dotEnv'

import { logError } from '../helpers'

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
  }
}

export function captureException (e) {
  if (ENV !== 'local') {
    try {
      if (e.stacktrace) {
        Sentry.captureException(e)
      } else if (typeof e === 'object') {
        Sentry.captureException(new Error(JSON.stringify(e)))
      } else {
        Sentry.captureException(new Error(e.toString()))
      }
    } catch (e) {
      logError(e, 'Sentry.captureException')
      Sentry.captureException('Cannot capture exception')
    }
  }
}

export function configure () {
  if (ENV !== 'local') {
    Sentry.config(SENTRY_DSN, {
      release: RELEASE,
    }).install()
    Sentry.setDist(DISTRIBUTION)
  }
}

export function captureBreadcrumb (message, category, data) {
  if (ENV !== 'local') {
    const bcData = { message, category }
    if (data) {
      bcData[data] = data
    }
    Sentry.captureBreadcrumb(data)
  }
}
