import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation'
import { configure } from './services/Sentry'
import { combineReducers } from 'redux-immutable';
import Mapbox from '@mapbox/react-native-mapbox-gl';
import  Mixpanel from 'react-native-mixpanel'
import { MAPBOX_TOKEN, MIXPANEL_TOKEN } from 'react-native-dotenv'

import { appInitialized } from "./actions/functional"
import { logDebug } from './helpers'
import logger from './middleware/logger'
import storeLocalState from './middleware/localstate'
import { registerScreens } from './screens'

import CurrentRideReducer from './reducers/CurrentRide'
import LocalStateReducer from './reducers/LocalState'
import PouchRecordsReducer from './reducers/PouchRecords'

import { YellowBox } from 'react-native'
// Remove when on > 0.56
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])

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
  Navigation.events().registerAppLaunchedListener(() => {
    Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN).then(() => {
      store.dispatch(appInitialized())
    })
  })
  return store
}

