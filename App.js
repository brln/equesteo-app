import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation'
import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from 'react-native-dotenv'
import { combineReducers } from 'redux-immutable';


import { appInitialized } from "./actions"
import logger from './middleware/logger'
import storeToCouch from './middleware/couch'
import uploadPhotos from './middleware/photos'
import storeLocalState from './middleware/localstate'
import AppReducer from './reducer'
import { FEED, SIGNUP_LOGIN, registerScreens } from './screens'

const store = createStore(
  combineReducers({main: AppReducer}),
  undefined,
  applyMiddleware(
    thunkMiddleware,
    logger,
    uploadPhotos,
    storeToCouch,
    storeLocalState,
  )
)

if (ENV !== 'local') {
  Sentry.config(SENTRY_DSN, {
    release: RELEASE,
    handlePromiseRejection: true
  }).install()
  Sentry.setDist(DISTRIBUTION)
}

export default function start () {
  registerScreens(store, Provider)
  Navigation.events().registerAppLaunchedListener(async () => {
    await store.dispatch(appInitialized())
  })
}

// export default class App {
//   constructor() {


//   }
//
//   onStoreUpdate() {
//     const root = store.getState().getIn(['main', 'localState', 'root'])
//     if (this.currentRoot !== root) {
//       this.currentRoot = root
//
//       console.log('aaaaaaaaaaaaa')
//       Navigation.events().registerAppLaunchedListener(() => {
//         console.log('bbbbbbbbbbbb')
//         this.startApp(root)
//       })
//     }
//   }
//
//   startApp(root) {
//     switch (root) {
//       case 'login':
//         Navigation.startSingleScreenApp({
//           screen: {
//             screen: SIGNUP_LOGIN,
//           }
//         })
//         return
//       case 'after-login':
//         Navigation.startSingleScreenApp({
//           screen: FEED_DETAILS,
//           drawer: {
//             left: {
//               screen: DRAWER,
//             }
//           }
//         })
//         return
//       default:
//         throw Error('unknown app root!')
//         return
//
//     }
//   }
//
// }