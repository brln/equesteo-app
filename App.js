import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation'
import { configure } from './services/Sentry'
import { combineReducers } from 'redux-immutable';
import Mapbox from '@react-native-mapbox-gl/maps';

import { MAPBOX_TOKEN } from './dotEnv'
import functional from "./actions/functional"
import { logDebug } from './helpers'
import logger from './middleware/logger'
import storeLocalState from './middleware/localstate'
import { registerScreens } from './screens/main'
import { registerCareScreens } from './screens/care'
import { firstStartRegisterScreens } from './screens/firstStart'

import CurrentRideReducer from './reducers/CurrentRide'
import LocalStateReducer from './reducers/LocalState'
import PouchRecordsReducer from './reducers/PouchRecords'

import { NativeModules, NativeEventEmitter, YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillMount is deprecated',
  'Task orphaned for request'
])

// Install dummy handlers so we don't see the tts warnings
// https://github.com/ak1394/react-native-tts/issues/1
const ee = new NativeEventEmitter(NativeModules.TextToSpeech);
ee.addListener('tts-start', () => {})
ee.addListener('tts-finish', () => {})
ee.addListener('tts-cancel', () => {})

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
    storeLocalState,
  )
)

global.logDebug = logDebug

configure()
Mapbox.setAccessToken(MAPBOX_TOKEN)


export default function start () {
  registerScreens(store, Provider)
  registerCareScreens(store, Provider)
  firstStartRegisterScreens(store, Provider)
  Navigation.events().registerAppLaunchedListener(() => {
    store.dispatch(functional.appInitialized())
  })
  return store
}

