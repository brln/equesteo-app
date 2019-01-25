import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from 'react-native-dotenv'

import { logError } from '../helpers'

export function setUserContext(userID) {
  if (ENV !== 'local') {
    Sentry.setUserContext({
      id: userID,
    });
  }
}

export function captureException (e) {
  if (ENV !== 'local') {
    try {
      if (e.stacktrace) {
        Sentry.captureException(e)
      } else {
        Sentry.captureException(new Error(e.toString()))
      }
    } catch (e) {
      logError(e, 'Sentry.captureException')
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

export function captureBreadcrumb (message, category) {
  if (ENV !== 'local') {
    Sentry.captureBreadcrumb(
      { message, category }
    )
  }
}
