import { Navigation } from 'react-native-navigation';

import Drawer from './components/Drawer'
import NewHorse from './components/NewHorse'

import AccountContainer from './containers/Account'
import BarnContainer from './containers/Barn'
import LoginContainer from './containers/Login'
import RecorderContainer from './containers/Recorder'
import RidesContainer from './containers/Rides'
import SignupContainer from './containers/Signup'

import Ride from './components/Ride'

export function registerScreens(store, Provider) {
  Navigation.registerComponent('equesteo.Barn', () => BarnContainer, store, Provider)
  Navigation.registerComponent('equesteo.Login', () => LoginContainer, store, Provider)
  Navigation.registerComponent('equesteo.Signup', () => SignupContainer, store, Provider)
  Navigation.registerComponent('equesteo.Rides', () => RidesContainer, store, Provider)
  Navigation.registerComponent('equesteo.Recorder', () => RecorderContainer, store, Provider)
  Navigation.registerComponent('equesteo.Account', () => AccountContainer, store, Provider)

  Navigation.registerComponent('equesteo.Drawer', () => Drawer)
  Navigation.registerComponent('equesteo.Ride', () => Ride)
  Navigation.registerComponent('equesteo.NewHorse', () => NewHorse)
}