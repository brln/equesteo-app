import React, {Component} from 'react';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation';



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

export default class App {
  constructor() {
    store.subscribe(this.onStoreUpdate.bind(this));
    store.dispatch(appInitialized());
  }

  onStoreUpdate() {
    const root = store.getState().localState.app
    if (this.currentRoot !== root) {
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
              fixedWidth: 500,
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