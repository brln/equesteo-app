import React, {Component} from 'react';
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens';

import {appInitialized} from "./actions"
import AppReducer from './reducer'

const store = createStore(AppReducer, undefined, applyMiddleware(thunkMiddleware))

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
        Navigation.startTabBasedApp({
          tabs: [
            {
              label: 'Log In',
              screen: 'equesteo.Login',
              icon: require('./img/login.png'),
              selectedIcon: require('./img/login.png'),
              title: 'Log In',
              // navigatorStyle: {}
            },
            {
              label: 'Sign Up',
              screen: 'equesteo.Signup',
              icon: require('./img/signup.png'),
              selectedIcon: require('./img/signup.png'),
              title: 'Sign Up',
              // overrideBackPress: true,
              // navigatorStyle: {}
            },
          ],
          appStyle: {
            forceTitlesDisplay: true,
          }
        })
        return
      case 'after-login':
        Navigation.startSingleScreenApp({
          screen: {
            screen: 'equesteo.Rides',
            title: 'My Rides',
            navigatorButtons: {
              rightButtons: [
              ],
              leftButtons: [
                {
                  id: 'sideMenu'
                }

              ]
            }
          },
          drawer: {
            left: {
              screen: 'equesteo.Drawer',
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