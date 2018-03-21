import { Navigation } from 'react-native-navigation';

import NewHorse from './components/NewHorse'
import Ride from './components/Ride'

import AccountContainer from './containers/Account'
import BarnContainer from './containers/Barn'
import DrawerContainer from './containers/Drawer'
import FindFriendsContainer from './containers/FindFriends'
import RecorderContainer from './containers/Recorder'
import RidesContainer from './containers/Rides'
import RideDetailsContainer from './containers/RideDetails'
import SignupLoginContainer from './containers/SignupLogin'

export const ACCOUNT = 'equesteo.Account'
export const BARN = 'equesteo.Barn'
export const DRAWER = 'equesteo.Drawer'
export const FIND_FRIENDS = 'equesteo.FindFriends'
export const NEW_HORSE = 'equesteo.NewHorse'
export const RECORDER = 'equesteo.Recorder'
export const RIDE = 'equesteo.Ride'
export const RIDES = 'equesteo.Rides'
export const RIDE_DETAILS = 'equesteo.RideDetails'
export const SIGNUP_LOGIN = 'equesteo.SignupLogin'

export const RIDES_DETAILS = {
  screen: RIDES,
  title: 'My Rides',
  navigatorButtons: {
    leftButtons: [{
      id: 'sideMenu'
    }]
  },
}

export function registerScreens(store, Provider) {
  Navigation.registerComponent(BARN, () => BarnContainer, store, Provider)
  Navigation.registerComponent(DRAWER, () => DrawerContainer, store, Provider)
  Navigation.registerComponent(FIND_FRIENDS, () => FindFriendsContainer, store, Provider)
  Navigation.registerComponent(SIGNUP_LOGIN, () => SignupLoginContainer, store, Provider)
  Navigation.registerComponent(RIDES, () => RidesContainer, store, Provider)
  Navigation.registerComponent(RIDE_DETAILS, () => RideDetailsContainer, store, Provider)
  Navigation.registerComponent(RECORDER, () => RecorderContainer, store, Provider)
  Navigation.registerComponent(ACCOUNT, () => AccountContainer, store, Provider)

  Navigation.registerComponent(RIDE, () => Ride)
  Navigation.registerComponent(NEW_HORSE, () => NewHorse)
}

