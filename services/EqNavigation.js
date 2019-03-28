import { Navigation } from 'react-native-navigation'
import { logError } from '../helpers'

export default class EqNavigation {
  static debounce = false

  static push (currentComponent, opts) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      console.log('debounce')
      return Navigation.push(currentComponent, opts).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 100)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.resolve()
    }
  }

  static pop (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.pop(currentComponent).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 100)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.resolve()
    }
  }

  static popToRoot (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.popToRoot(currentComponent).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 100)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.resolve()
    }
  }
}