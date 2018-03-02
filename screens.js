import { Navigation } from 'react-native-navigation';

import LoginContainer from './containers/Login'
import RecorderContainer from './containers/Recorder'
import RidesContainer from './containers/Rides'
import SignupContainer from './containers/Signup'

import Ride from './components/Ride'


export function registerScreens(store, Provider) {
  Navigation.registerComponent('equestio.Login', () => LoginContainer, store, Provider);
  Navigation.registerComponent('equestio.Signup', () => SignupContainer, store, Provider);
  Navigation.registerComponent('equestio.Rides', () => RidesContainer, store, Provider);
  Navigation.registerComponent('equestio.Recorder', () => RecorderContainer, store, Provider);
  Navigation.registerComponent('equestio.Ride', () => Ride, store, Provider)
}