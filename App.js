import React, {Component} from 'react';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation';
import { Sentry } from 'react-native-sentry';

import { appInitialized } from "./actions"
import logger from './middleware/logger'
import storeToCouch from './middleware/couch'
import uploadPhotos from './middleware/photos'
import AppReducer from './reducer'
import { DRAWER, FEED_DETAILS, SIGNUP_LOGIN, registerScreens } from './screens'

const store = createStore(
  AppReducer,
  undefined,
  applyMiddleware(
    thunkMiddleware,
    logger,
    uploadPhotos,
    storeToCouch,
  )
)

registerScreens(store, Provider)

Sentry.config('https://a392ba52ce124829a8afc43dc4dc44de:5dfdf9a68b84429dbbc693a96de52795@sentry.io/1226675').install();

export default class App {
  constructor() {
    store.subscribe(this.onStoreUpdate.bind(this));
    store.dispatch(appInitialized());
  }

  onStoreUpdate() {
    const root = store.getState().localState.root
    console.log('root: ' + root)
    if (this.currentRoot !== root) {
      console.log('changing root!: ' + root)
      this.currentRoot = root;
      this.startApp(root);
    }
  }

  startApp(root) {
    switch (root) {
      case 'login':
        Navigation.startSingleScreenApp({
          screen: {
            screen: SIGNUP_LOGIN,
          }
        })
        return
      case 'after-login':
        Navigation.startSingleScreenApp({
          screen: FEED_DETAILS,
          drawer: {
            left: {
              screen: DRAWER,
            }
          }
        })
        return
      default:
        console.log('unknown app root!')
        return

    }
  }

}