import { Navigation } from 'react-native-navigation';

import About from './components/About'
import BarnContainer from './containers/Barn'
import DrawerContainer from './containers/Drawer'
import FeedContainer from './containers/Feed'
import FindPeopleContainer from './containers/FindPeople'
import FirstStartContainer from './containers/FirstStart'
import FollowListContainer from './containers/FollowList'
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

export const ABOUT_PAGE = 'equesteo.About'
export const BARN = 'equesteo.Barn'
export const DRAWER = 'equesteo.Drawer'
export const FEED = 'equesteo.Feed'
export const FIRST_START = 'equesteo.FirstStart'
export const FOLLOW_LIST = 'equesteo.FollowList'
export const HORSE_PROFILE = 'equesteo.HorseProfile'
export const FIND_PEOPLE = 'equesteo.FindPeople'
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

export function registerScreens(store, Provider) {
  Navigation.registerComponent(ABOUT_PAGE, () => About)
  Navigation.registerComponentWithRedux(BARN, () => BarnContainer, Provider, store)
  Navigation.registerComponentWithRedux(DRAWER, () => DrawerContainer, Provider, store)
  Navigation.registerComponentWithRedux(FEED, () => FeedContainer, Provider, store)
  Navigation.registerComponentWithRedux(FIND_PEOPLE, () => FindPeopleContainer, Provider, store)
  Navigation.registerComponentWithRedux(FIRST_START, () => FirstStartContainer, Provider, store)
  Navigation.registerComponentWithRedux(FOLLOW_LIST, () => FollowListContainer, Provider, store)
  Navigation.registerComponentWithRedux(HORSE_PROFILE, () => HorseProfileContainer, Provider, store)
  Navigation.registerComponentWithRedux(MAP, () => MapContainer, Provider, store)
  Navigation.registerComponentWithRedux(PHOTO_LIGHTBOX, () => PhotoLightboxContainer, Provider, store)
  Navigation.registerComponentWithRedux(PROFILE, () => ProfileContainer, Provider, store)
  Navigation.registerComponentWithRedux(RECORDER, () => RecorderContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE, () => RideContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_COMMENTS, () => RideCommentsContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_DETAILS, () => RideDetailsContainer, Provider, store)
  Navigation.registerComponentWithRedux(SIGNUP_LOGIN, () => SignupLoginContainer, Provider, store)
  Navigation.registerComponentWithRedux(TRAINING, () => TrainingContainer, Provider, store)
  Navigation.registerComponentWithRedux(UPDATE_HORSE, () => UpdateHorseContainer, Provider, store)
  Navigation.registerComponentWithRedux(UPDATE_PROFILE, () => UpdateProfileContainer, Provider, store)
}

