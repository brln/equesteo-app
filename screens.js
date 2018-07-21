import { Navigation } from 'react-native-navigation';

import BarnContainer from './containers/Barn'
import DrawerContainer from './containers/Drawer'
import FeedContainer from './containers/Feed'
import FollowingContainer from './containers/Following'
import HorseProfileContainer from './containers/HorseProfile'
import MapContainer from './containers/Map'
import PhotoLightboxContainer from './containers/PhotoLightbox'
import ProfileContainer from './containers/Profile'
import RecorderContainer from './containers/Recorder'
import RideCommentsContainer from './containers/RideComments'
import RideContainer from './containers/Ride'
import RideDetailsContainer from './containers/RideDetails'
import SignupLoginContainer from './containers/SignupLogin'
import TrainingContainer from './containers/Training'
import UpdateHorseContainer from './containers/UpdateHorse'
import UpdateProfileContainer from './containers/UpdateProfile'

export const BARN = 'equesteo.Barn'
export const DRAWER = 'equesteo.Drawer'
export const FEED = 'equesteo.Feed'
export const HORSE_PROFILE = 'equesteo.HorseProfile'
export const FOLLOWING = 'equesteo.Following'
export const MAP = 'equesteo.Map'
export const PHOTO_LIGHTBOX = 'equesteo.PhotoLightbox'
export const PROFILE = 'equesteo.Profile'
export const RECORDER = 'equesteo.Recorder'
export const RIDE = 'equesteo.Ride'
export const RIDE_COMMENTS = 'equesteo.RideComments'
export const RIDE_DETAILS = 'equesteo.RideDetails'
export const SIGNUP_LOGIN = 'equesteo.SignupLogin'
export const TRAINING = 'equesteo.Training'
export const UPDATE_HORSE = 'equesteo.Horse'
export const UPDATE_PROFILE = 'equesteo.UpdateProfile'

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
  Navigation.registerComponent(HORSE_PROFILE, () => HorseProfileContainer, store, Provider)
  Navigation.registerComponent(MAP, () => MapContainer, store, Provider)
  Navigation.registerComponent(PHOTO_LIGHTBOX, () => PhotoLightboxContainer, store, Provider)
  Navigation.registerComponent(PROFILE, () => ProfileContainer, store, Provider)
  Navigation.registerComponent(RECORDER, () => RecorderContainer, store, Provider)
  Navigation.registerComponent(RIDE, () => RideContainer, store, Provider)
  Navigation.registerComponent(RIDE_COMMENTS, () => RideCommentsContainer, store, Provider)
  Navigation.registerComponent(RIDE_DETAILS, () => RideDetailsContainer, store, Provider)
  Navigation.registerComponent(SIGNUP_LOGIN, () => SignupLoginContainer, store, Provider)
  Navigation.registerComponent(TRAINING, () => TrainingContainer, store, Provider)
  Navigation.registerComponent(UPDATE_HORSE, () => UpdateHorseContainer, store, Provider)
  Navigation.registerComponent(UPDATE_PROFILE, () => UpdateProfileContainer, store, Provider)
}

