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
              screen: 'equestio.Login',
              icon: require('./img/login.png'),
              selectedIcon: require('./img/login.png'),
              title: 'Log In',
              // navigatorStyle: {}
            },
            {
              label: 'Sign Up',
              screen: 'equestio.Signup',
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
        Navigation.startTabBasedApp({
          tabs: [
            {
              label: 'Recorder',
              screen: 'equestio.Recorder',
              icon: require('./img/target.png'),
              selectedIcon: require('./img/target.png'),
              title: 'Recorder',
              // overrideBackPress: true,
              // navigatorStyle: {}
            },
            {
              label: 'Rides',
              screen: 'equestio.Rides',
              icon: require('./img/path.png'),
              selectedIcon: require('./img/path.png'),
              title: 'Rides',
              // navigatorStyle: {}
            },
            {
              label: 'Account',
              screen: 'equestio.Account',
              icon: require('./img/account.png'),
              selectedIcon: require('./img/account.png'),
              title: 'My Account',
              // navigatorStyle: {}
            }
          ],
          // passProps: {},
          // animationType: 'slide-down',
          // title: 'Equestio Title',
          // drawer: {
          //   left: {
          //     screen: 'example.BottomTabsSideMenu' // unique ID registered with Navigation.registerScreen
          //   },
          //   disableOpenGesture: false, // optional, can the drawer be opened with a swipe instead of button
          //   passProps: {
          //     title: 'Hello from SideMenu'
          //   }
          // },
          // appStyle: {
          //   bottomTabBadgeTextColor: '#ffffff',
          //   bottomTabBadgeBackgroundColor: '#ff0000'
          // }
        })
        return
      default:
        console.log('unknown app root!')
        return

    }

  }

}