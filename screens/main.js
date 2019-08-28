import { Navigation } from 'react-native-navigation';

import About from '../components/About'
import BarnContainer from '../containers/Barn'
import Camera from '../containers/Camera'
import ColorPickerContainer from '../containers/UpdateHorse/ColorPicker'
import DrawerContainer from '../containers/Drawer'
import FeedContainer from '../containers/Feed/Feed'
import RideButton from '../containers/Feed/RideButton'
import FeedbackContainer from '../containers/Feedback'
import FindPeopleContainer from '../containers/FindPeople'
import FollowListContainer from '../containers/FollowList'
import ForgotContainer from '../containers/SignupLogin/Forgot'
import HorseProfileContainer from '../containers/HorseProfile'
import HorseToolsContainer from '../containers/HorseTools'
import LeaderboardsContainer from '../containers/Leaderboards'
import LocationLog from '../components/LocationLog'
import LoginContainer from '../containers/SignupLogin/Login'
import MapContainer from '../containers/Map'
import MoreContainer from '../containers/More'
import NeedsSyncContainer from '../containers/NeedsSyncContainer'
import NotificationsListContainer from '../containers/NotificationsList'
import NotificationButton from '../containers/Feed/NotificationButton'
import NewPasswordContainer from '../containers/SignupLogin/NewPassword'
import PhotoLightboxContainer from '../containers/PhotoLightbox'
import ProfileContainer from '../containers/Profile'
import RecorderContainer from '../containers/Recorder/Recorder'
import ResetCodeContainer from '../containers/SignupLogin/ResetCode'
import RideChartsContainer from '../containers/RideCharts'
import RideContainer from '../containers/Ride'
import RideAtlasContainer from '../containers/RideAtlas'
import RideToolsContainer from '../containers/RideTools'
import SettingsContainer from '../containers/Settings'
import ShareRideContainer from '../containers/ShareRide'
import SignupContainer from '../containers/SignupLogin/Signup'
import HoofTracksContainer from '../containers/Recorder/HoofTracks'
import TrainingContainer from '../containers/Training'
import UpdateHorseContainer from '../containers/UpdateHorse/UpdateHorse'
import UpdateRideContainer from '../containers/UpdateRide'
import UpdateProfileContainer from '../containers/UpdateProfile'

import {
  ABOUT_PAGE,
  BARN,
  CAMERA,
  COLOR_PICKER,
  DRAWER,
  FEED,
  FEEDBACK,
  FOLLOW_LIST,
  FORGOT,
  HORSE_PROFILE,
  HORSE_TOOLS,
  FIND_PEOPLE,
  LEADERBOARDS,
  LOCATION_LOG,
  LOGIN,
  MAP,
  NEEDS_SYNC,
  MORE,
  NOTIFICATION_BUTTON,
  NOTIFICATIONS_LIST,
  NEW_PASSWORD,
  PHOTO_LIGHTBOX,
  PROFILE,
  RECORDER,
  RESET_CODE,
  RIDE,
  RIDE_ATLAS,
  RIDE_BUTTON,
  RIDE_CHARTS,
  RIDE_TOOLS,
  SETTINGS,
  SHARE_RIDE,
  SIGNUP,
  START_HOOF_TRACKS,
  TRAINING,
  UPDATE_HORSE,
  UPDATE_PROFILE,
  UPDATE_RIDE,
} from './consts/main'



export function registerScreens(store, Provider) {
  Navigation.registerComponent(ABOUT_PAGE, () => About)
  Navigation.registerComponent(LOCATION_LOG, () => LocationLog)
  Navigation.registerComponentWithRedux(CAMERA, () => Camera, Provider, store)
  Navigation.registerComponentWithRedux(COLOR_PICKER, () => ColorPickerContainer, Provider, store)
  Navigation.registerComponentWithRedux(BARN, () => BarnContainer, Provider, store)
  Navigation.registerComponentWithRedux(DRAWER, () => DrawerContainer, Provider, store)
  Navigation.registerComponentWithRedux(FEED, () => FeedContainer, Provider, store)
  Navigation.registerComponentWithRedux(FEEDBACK, () => FeedbackContainer, Provider, store)
  Navigation.registerComponentWithRedux(FIND_PEOPLE, () => FindPeopleContainer, Provider, store)
  Navigation.registerComponentWithRedux(FOLLOW_LIST, () => FollowListContainer, Provider, store)
  Navigation.registerComponentWithRedux(FORGOT, () => ForgotContainer, Provider, store)
  Navigation.registerComponentWithRedux(HORSE_PROFILE, () => HorseProfileContainer, Provider, store)
  Navigation.registerComponentWithRedux(HORSE_TOOLS, () => HorseToolsContainer, Provider, store)
  Navigation.registerComponentWithRedux(LEADERBOARDS, () => LeaderboardsContainer, Provider, store)
  Navigation.registerComponentWithRedux(LOGIN, () => LoginContainer, Provider, store)
  Navigation.registerComponentWithRedux(MAP, () => MapContainer, Provider, store)
  Navigation.registerComponentWithRedux(NEEDS_SYNC, () => NeedsSyncContainer, Provider, store)
  Navigation.registerComponentWithRedux(NEW_PASSWORD, () => NewPasswordContainer, Provider, store)
  Navigation.registerComponentWithRedux(NOTIFICATION_BUTTON, () => NotificationButton, Provider, store)
  Navigation.registerComponentWithRedux(NOTIFICATIONS_LIST, () => NotificationsListContainer, Provider, store)
  Navigation.registerComponentWithRedux(MORE, () => MoreContainer, Provider, store)
  Navigation.registerComponentWithRedux(PHOTO_LIGHTBOX, () => PhotoLightboxContainer, Provider, store)
  Navigation.registerComponentWithRedux(PROFILE, () => ProfileContainer, Provider, store)
  Navigation.registerComponentWithRedux(RECORDER, () => RecorderContainer, Provider, store)
  Navigation.registerComponentWithRedux(RESET_CODE, () => ResetCodeContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE, () => RideContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_ATLAS, () => RideAtlasContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_BUTTON, () => RideButton, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_CHARTS, () => RideChartsContainer, Provider, store)
  Navigation.registerComponentWithRedux(RIDE_TOOLS, () => RideToolsContainer, Provider, store)
  Navigation.registerComponentWithRedux(SETTINGS, () => SettingsContainer, Provider, store)
  Navigation.registerComponentWithRedux(SHARE_RIDE, () => ShareRideContainer, Provider, store)
  Navigation.registerComponentWithRedux(SIGNUP, () => SignupContainer, Provider, store)
  Navigation.registerComponentWithRedux(START_HOOF_TRACKS, () => HoofTracksContainer, Provider, store)
  Navigation.registerComponentWithRedux(TRAINING, () => TrainingContainer, Provider, store)
  Navigation.registerComponentWithRedux(UPDATE_RIDE, () => UpdateRideContainer, Provider, store)
  Navigation.registerComponentWithRedux(UPDATE_HORSE, () => UpdateHorseContainer, Provider, store)
  Navigation.registerComponentWithRedux(UPDATE_PROFILE, () => UpdateProfileContainer, Provider, store)
}

