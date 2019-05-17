import { Navigation } from 'react-native-navigation'
import { logError } from '../helpers'

export default class EqNavigation {
  static debounce = false

  static push (currentComponent, opts) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      if (!opts.component.options) {
        opts.component.options = {}
      }
      opts.component.options.blurOnUnmount = true
      return Navigation.push(currentComponent, opts).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        })
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.reject('debounce')
    }
  }

  static pop (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.pop(currentComponent).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 50)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.reject()
    }
  }

  static popTo (componentID) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.popTo(componentID).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 50)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.reject()
    }
  }

  static popToRoot (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.popToRoot(currentComponent).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 50)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.reject()
    }
  }

  static setStackRoot (currentComponent, opts) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return Navigation.setStackRoot(currentComponent, opts).then(() => {
        setTimeout(() => {
          EqNavigation.debounce = false
        }, 50)
      }).catch(e => {
        EqNavigation.debounce = false
        logError(e)
      })
    } else {
      return Promise.reject()
    }
  }
}
