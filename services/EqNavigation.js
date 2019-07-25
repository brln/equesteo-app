import { Navigation } from 'react-native-navigation'
import { logError } from '../helpers'
import TimeoutManager from './TimeoutManager'

export default class EqNavigation {
  static debounce = false

  static wrap (navCommand) {
    return navCommand.then(() => {
      return new Promise(res => {
        TimeoutManager.newTimeout(() => {
          EqNavigation.debounce = false
          res()
        }, 50)
      })
    }) .catch(e => {
      EqNavigation.debounce = false
      logError(e, 'EqNavigation.wrap')
    })
  }

  static push (currentComponent, opts) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      if (!opts.component.options) {
        opts.component.options = {}
      }
      opts.component.options.blurOnUnmount = true
      return this.wrap(Navigation.push(currentComponent, opts))
    } else {
      return Promise.reject('debounce')
    }
  }

  static pop (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return this.wrap(Navigation.pop(currentComponent))
    } else {
      return Promise.reject()
    }
  }

  static popTo (componentID) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return this.wrap(Navigation.popTo(componentID))
    } else {
      return Promise.reject()
    }
  }

  static popToRoot (currentComponent) {
    if (!EqNavigation.debounce) {
      EqNavigation.debounce = true
      return this.wrap(Navigation.popToRoot(currentComponent))
    } else {
      return Promise.reject()
    }
  }
}
