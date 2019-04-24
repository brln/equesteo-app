import { Navigation } from 'react-native-navigation';

import Calendar from '../containers/CareCalendar/Calendar'
import CareEvent from '../containers/CareCalendar/CareEvent'
import Day from '../containers/CareCalendar/Day'
import EventList from '../containers/CareCalendar/EventList'
import EventTools from '../containers/CareCalendar/EventTools'
import FarrierPage from '../containers/CareCalendar/Farrier'
import FeedPage from '../containers/CareCalendar/FeedPage'
import GroundworkPage from '../containers/CareCalendar/GroundworkPage'
import HorsePicker from '../containers/CareCalendar/HorsePicker'
import NewMainEventMenu from '../containers/CareCalendar/NewMainEventMenu'
import NewSecondaryEventMenu from '../containers/CareCalendar/NewSecondaryEventMenu'
import TimePicker from '../containers/CareCalendar/TimePicker'
import Veterinary from '../containers/CareCalendar/Veterinary'

export const CARE_CALENDAR = 'equesteo.CareCalendar'
export const CARE_EVENT = 'equesteo.CareEvent'
export const DAY = 'equesteo.Day'
export const EVENT_LIST = 'equesteo.EventList'
export const EVENT_TOOLS = 'equesteo.EventTools'
export const FARRIER = 'equesteo.Farrier'
export const GROUNDWORK = 'equesteo.Groundwork'
export const HORSE_PICKER = 'equesteo.HorsePicker'
export const FEED_PAGE = 'equesteo.FeedPage'
export const NEW_MAIN_EVENT_MENU = 'equesteo.NewMainEventMenu'
export const NEW_SECONDARY_EVENT_MENU = 'equesteo.NewSecondaryEventMenu'
export const TIME_PICKER = 'equesteo.TimePicker'
export const VETERINARY = 'equesteo.Veterinary'

export function registerCareScreens(store, Provider) {
  Navigation.registerComponentWithRedux(CARE_CALENDAR, () => Calendar, Provider, store)
  Navigation.registerComponentWithRedux(CARE_EVENT, () => CareEvent, Provider, store)
  Navigation.registerComponentWithRedux(DAY, () => Day, Provider, store)
  Navigation.registerComponentWithRedux(EVENT_LIST, () => EventList, Provider, store)
  Navigation.registerComponentWithRedux(EVENT_TOOLS, () => EventTools, Provider, store)
  Navigation.registerComponentWithRedux(FARRIER, () => FarrierPage, Provider, store)
  Navigation.registerComponentWithRedux(FEED_PAGE, () => FeedPage, Provider, store)
  Navigation.registerComponentWithRedux(GROUNDWORK, () => GroundworkPage, Provider, store)
  Navigation.registerComponentWithRedux(HORSE_PICKER, () => HorsePicker, Provider, store)
  Navigation.registerComponentWithRedux(NEW_MAIN_EVENT_MENU, () => NewMainEventMenu, Provider, store)
  Navigation.registerComponentWithRedux(NEW_SECONDARY_EVENT_MENU, () => NewSecondaryEventMenu, Provider, store)
  Navigation.registerComponentWithRedux(TIME_PICKER, () => TimePicker, Provider, store)
  Navigation.registerComponentWithRedux(VETERINARY, () => Veterinary, Provider, store)

}
