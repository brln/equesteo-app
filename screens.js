import { Navigation } from 'react-native-navigation';

import NewHorse from './components/NewHorse'
import Ride from './components/Ride'

import AccountContainer from './containers/Account'
import BarnContainer from './containers/Barn'
import DrawerContainer from './containers/Drawer'
import LoginContainer from './containers/Login'
import RecorderContainer from './containers/Recorder'
import RidesContainer from './containers/Rides'
import RideDetailsContainer from './containers/RideDetails'
import SignupContainer from './containers/Signup'

export const BARN = 'equesteo.Barn'
export const LOGIN = 'equesteo.Login'
export const SIGNUP = 'equesteo.Signup'
export const RIDES = 'equesteo.Rides'
export const RIDE_DETAILS = 'equesteo.RideDetails'
export const RECORDER = 'equesteo.Recorder'
export const ACCOUNT = 'equesteo.Account'
export const DRAWER = 'equesteo.Drawer'
export const RIDE = 'equesteo.Ride'
export const NEW_HORSE = 'equesteo.NewHorse'

export function registerScreens(store, Provider) {
  Navigation.registerComponent(BARN, () => BarnContainer, store, Provider)
  Navigation.registerComponent(DRAWER, () => DrawerContainer, store, Provider)
  Navigation.registerComponent(LOGIN, () => LoginContainer, store, Provider)
  Navigation.registerComponent(SIGNUP, () => SignupContainer, store, Provider)
  Navigation.registerComponent(RIDES, () => RidesContainer, store, Provider)
  Navigation.registerComponent(RIDE_DETAILS, () => RideDetailsContainer, store, Provider)
  Navigation.registerComponent(RECORDER, () => RecorderContainer, store, Provider)
  Navigation.registerComponent(ACCOUNT, () => AccountContainer, store, Provider)

  Navigation.registerComponent(RIDE, () => Ride)
  Navigation.registerComponent(NEW_HORSE, () => NewHorse)
}