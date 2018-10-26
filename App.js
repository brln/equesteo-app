import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation'
import { Sentry } from 'react-native-sentry'
import { DISTRIBUTION, ENV, RELEASE, SENTRY_DSN } from 'react-native-dotenv'
import { combineReducers } from 'redux-immutable';


import { appInitialized } from "./actions"
import { logDebug } from './helpers'
import logger from './middleware/logger'
import storeToCouch from './middleware/couch'
import uploadPhotos from './middleware/photos'
import storeLocalState from './middleware/localstate'
import { registerScreens } from './screens'

import CurrentRideReducer from './reducers/CurrentRide'
import LocalStateReducer from './reducers/LocalState'
import PouchRecordsReducer from './reducers/PouchRecords'

console.log('creating store')
const store = createStore(
  combineReducers({
    pouchRecords: PouchRecordsReducer,
    localState: LocalStateReducer,
    currentRide: CurrentRideReducer
  }),
  undefined,
  applyMiddleware(
    thunkMiddleware,
    logger,
    uploadPhotos,
    storeToCouch,
    storeLocalState,
  )
)
console.log('STORE CREATED')

global.logDebug = logDebug

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
  return store
}

