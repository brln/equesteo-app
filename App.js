import React, { Component } from 'react';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';

import AppReducer from './reducer'

const store = createStore(AppReducer, undefined, applyMiddleware(thunkMiddleware))

registerScreens(store, Provider)

export default class App {
	constructor () {
		// store.subscribe(this.onStoreUpdate.bind(this));
    this.startApp('')
	}

	onStoreUpdate () {
		const { root } = store.getState.app
    if (this.currentRoot !== root) {
      this.currentRoot = root;
      this.startApp(root);
    }
	}

	startApp (root) {
		switch (root) {
			// case 'login':
       //  Navigation.startSingleScreenApp({
       //    screen: {
       //      screen: 'equestio.LoginContainer',
       //      title: 'Login',
       //    }
       //  })
       //  return
			// case 'after-login':
			// 	Navigation.startTabBasedApp({
       //    tabs: [
       //      {
       //        label: 'Recorder',
       //        screen: 'equestio.Recorder',
       //        icon: require('./img/one.png'),
       //        selectedIcon: require('./img/one.png'),
       //        title: 'Recorder',
       //        // overrideBackPress: true,
       //        navigatorStyle: {}
       //      },
       //      {
       //        label: 'Rides',
       //        screen: 'equestio.Rides',
       //        icon: require('./img/one.png'),
       //        selectedIcon: require('./img/one.png'),
       //        title: 'Rides',
       //        navigatorStyle: {}
       //      }
       //    ],
       //    // passProps: {},
       //    // animationType: 'slide-down',
       //    // title: 'Equestio Title',
       //    // drawer: {
       //    //   left: {
       //    //     screen: 'example.BottomTabsSideMenu' // unique ID registered with Navigation.registerScreen
       //    //   },
       //    //   disableOpenGesture: false, // optional, can the drawer be opened with a swipe instead of button
       //    //   passProps: {
       //    //     title: 'Hello from SideMenu'
       //    //   }
       //    // },
       //    // appStyle: {
       //    //   bottomTabBadgeTextColor: '#ffffff',
       //    //   bottomTabBadgeBackgroundColor: '#ff0000'
       //    // }
       //  })
       //  return
      default:
        Navigation.startSingleScreenApp({
          screen: {
            screen: 'equestio.Login',
            title: 'Login',
          }
        })
        return
		}

	}

}