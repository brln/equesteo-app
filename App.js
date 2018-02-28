import React, { Component } from 'react';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';

import MainContainer from './containers/Main'
import AppReducer from './reducer'

const store = createStore(AppReducer, undefined, applyMiddleware(thunkMiddleware))

registerScreens(store, Provider)

Navigation.startSingleScreenApp({
	screen: {
		screen: 'equestio.MainContainer',
		title: 'Main',
	}
});
