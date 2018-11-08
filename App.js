import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation'
import { configure } from './services/Sentry'
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

global.logDebug = logDebug

configure()

export default function start () {
  registerScreens(store, Provider)
  Navigation.events().registerAppLaunchedListener(async () => {
    await store.dispatch(appInitialized())
  })
  return store
}

