import { captureMessage } from './Sentry'

const allTimeouts = {}

let timeoutID = 0

export default class TimeoutManager {
  static newTimeout(func, time) {
    const toDelete = timeoutID
    allTimeouts[timeoutID] = setTimeout(() => {
      new Promise(res => {
        func()
        res()
      }).then(() => {
        delete allTimeouts[toDelete]
      })
    }, time)
    timeoutID += 1
    if (Object.keys(allTimeouts).length > 10) {
      captureMessage('Too many timeout Events!')
    }
    return timeoutID
  }

  static deleteTimeout (id) {
    if (allTimeouts[id]) {
      clearTimeout(allTimeouts[id])
      delete allTimeouts[id]
    }
  }}