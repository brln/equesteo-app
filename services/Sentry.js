import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from 'react-native-dotenv'

export function setUserContext(userID) {
  if (ENV !== 'local') {
    Sentry.setUserContext({
      userID,
    });
  }
}

export function captureException (e) {
  if (ENV !== 'local') {
    try {
      Sentry.captureException(e)
    } catch (e) {
      console.log('not captured by sentry!')
      logDebug(e)
    }
  }
}

export function configure () {
  if (ENV !== 'local') {
    Sentry.config(SENTRY_DSN, {
      release: RELEASE,
      handlePromiseRejection: true
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
