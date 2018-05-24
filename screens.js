import { Navigation } from 'react-native-navigation';

import Map from './components/Map'
import NewHorse from './components/NewHorse'
import Ride from './components/Ride'

import AccountContainer from './containers/Account'
import BarnContainer from './containers/Barn'
import DrawerContainer from './containers/Drawer'
import FeedContainer from './containers/Feed'
import FollowingContainer from './containers/Following'
import HorseContainer from './containers/Horse'
import ProfileContainer from './containers/Profile'
import RecorderContainer from './containers/Recorder'
import RideDetailsContainer from './containers/RideDetails'
import SignupLoginContainer from './containers/SignupLogin'

export const ACCOUNT = 'equesteo.Account'
export const BARN = 'equesteo.Barn'
export const DRAWER = 'equesteo.Drawer'
export const FEED = 'equesteo.Feed'
export const HORSE = 'equesteo.Horse'
export const FOLLOWING = 'equesteo.Following'
export const MAP = 'equesteo.Map'
export const NEW_HORSE = 'equesteo.NewHorse'
export const PROFILE = 'equesteo.Profile'
export const RECORDER = 'equesteo.Recorder'
export const RIDE = 'equesteo.Ride'
export const RIDE_DETAILS = 'equesteo.RideDetails'
export const SIGNUP_LOGIN = 'equesteo.SignupLogin'

export const FEED_DETAILS = {
  screen: FEED,
  title: 'Feed',
  navigatorButtons: {
    leftButtons: [{
      id: 'sideMenu'
    }]
  }
}

export function registerScreens(store, Provider) {
  Navigation.registerComponent(BARN, () => BarnContainer, store, Provider)
  Navigation.registerComponent(DRAWER, () => DrawerContainer, store, Provider)
  Navigation.registerComponent(FEED, () => FeedContainer, store, Provider)
  Navigation.registerComponent(FOLLOWING, () => FollowingContainer, store, Provider)
  Navigation.registerComponent(HORSE, () => HorseContainer, store, Provider)
  Navigation.registerComponent(SIGNUP_LOGIN, () => SignupLoginContainer, store, Provider)
  Navigation.registerComponent(RIDE_DETAILS, () => RideDetailsContainer, store, Provider)
  Navigation.registerComponent(RECORDER, () => RecorderContainer, store, Provider)
  Navigation.registerComponent(ACCOUNT, () => AccountContainer, store, Provider)
  Navigation.registerComponent(PROFILE, () => ProfileContainer, store, Provider)

  Navigation.registerComponent(MAP, () => Map)
  Navigation.registerComponent(RIDE, () => Ride)
  Navigation.registerComponent(NEW_HORSE, () => NewHorse)
}

