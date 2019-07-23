import { Navigation } from 'react-native-navigation';

import FinalPage from '../containers/FirstStart/FinalPage'
import FirstHorsePage from '../containers/FirstStart/FirstHorsePage'
import FirstHorsePhoto from '../containers/FirstStart/FirstHorsePhoto'
import IntroPage from '../containers/FirstStart/IntroPage'
import NamePage from '../containers/FirstStart/NamePage'
import ProfilePhotoPage from '../containers/FirstStart/ProfilePhotoPage'

import {
  FINAL_PAGE,
  FIRST_HORSE_PAGE,
  FIRST_HORSE_PHOTO,
  INTRO_PAGE,
  NAME_PAGE,
  PROFILE_PHOTO_PAGE,
} from './consts/firstStart'


export function firstStartRegisterScreens(store, Provider) {
  Navigation.registerComponentWithRedux(FINAL_PAGE, () => FinalPage, Provider, store)
  Navigation.registerComponentWithRedux(FIRST_HORSE_PAGE, () => FirstHorsePage, Provider, store)
  Navigation.registerComponentWithRedux(FIRST_HORSE_PHOTO, () => FirstHorsePhoto, Provider, store)
  Navigation.registerComponentWithRedux(INTRO_PAGE, () => IntroPage, Provider, store)
  Navigation.registerComponentWithRedux(NAME_PAGE, () => NamePage, Provider, store)
  Navigation.registerComponentWithRedux(PROFILE_PHOTO_PAGE, () => ProfilePhotoPage, Provider, store)
}
