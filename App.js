import React, {Component} from 'react';
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens';

import { appInitialized } from "./actions"
import { storeToPouch } from "./middleware"
import AppReducer from './reducer'
import { DRAWER, FEED_DETAILS, SIGNUP_LOGIN } from './screens'

const store = createStore(
  AppReducer,
  undefined,
  applyMiddleware(thunkMiddleware, storeToPouch)
)

registerScreens(store, Provider)

export default class App {
  constructor() {
    store.subscribe(this.onStoreUpdate.bind(this));
    store.dispatch(appInitialized());
  }

  onStoreUpdate() {
    const root = store.getState().app
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