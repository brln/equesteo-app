import { Navigation } from 'react-native-navigation';

import Main from './containers/Main'


export function registerScreens(store, Provider) {
	Navigation.registerComponent('equestio.MainContainer', () => Main, store, Provider);
}