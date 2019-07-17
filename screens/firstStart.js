import { Navigation } from 'react-native-navigation';

import FinalPage from '../containers/FirstStart/FinalPage'
import FirstHorsePage from '../containers/FirstStart/FirstHorsePage'
import FirstHorsePhoto from '../containers/FirstStart/FirstHorsePhoto'
import IntroPage from '../containers/FirstStart/IntroPage'
import NamePage from '../containers/FirstStart/NamePage'
import ProfilePhotoPage from '../containers/FirstStart/ProfilePhotoPage'

export const FINAL_PAGE = 'equesteo.FinalPage'
export const FIRST_HORSE_PAGE = 'equesteo.FirstHorsePage'
export const FIRST_HORSE_PHOTO = 'equesteo.FirstHorsePhoto'
export const INTRO_PAGE = 'equesteo.IntroPage'
export const NAME_PAGE = 'equesteo.NamePage'
export const PROFILE_PHOTO_PAGE = 'equesteo.ProfilePhotoPage'


export function firstStartRegisterScreens(store, Provider) {
  Navigation.registerComponentWithRedux(FINAL_PAGE, () => FinalPage, Provider, store)
  Navigation.registerComponentWithRedux(FIRST_HORSE_PAGE, () => FirstHorsePage, Provider, store)
  Navigation.registerComponentWithRedux(FIRST_HORSE_PHOTO, () => FirstHorsePhoto, Provider, store)
  Navigation.registerComponentWithRedux(INTRO_PAGE, () => IntroPage, Provider, store)
  Navigation.registerComponentWithRedux(NAME_PAGE, () => NamePage, Provider, store)
  Navigation.registerComponentWithRedux(PROFILE_PHOTO_PAGE, () => ProfilePhotoPage, Provider, store)
}
