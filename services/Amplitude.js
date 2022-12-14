import amplitude from 'amplitude-js'

import config from "../dotEnv"

export const ACTIVATE_HOOF_TRACKS = 'ACTIVATE_HOOF_TRACKS'
export const ADD_CARE_EVENT = 'ADD_CARE_EVENT'
export const ADD_CARE_EVENT_NOW = 'ADD_CARE_EVENT_NOW'
export const ADD_COMMENT = 'ADD_COMMENT'
export const ADD_HORSE = 'ADD_HORSE'
export const ADD_HORSE_PHOTO_TO_OWN_HORSE = 'ADD_HORSE_PHOTO_TO_OWN_HORSE'
export const ADD_HORSE_PHOTO_TO_OTHERS_HORSE = 'ADD_HORSE_PHOTO_TO_OTHERS_HORSE'
export const ADD_RIDE_PHOTO = 'ADD_RIDE_PHOTO'
export const APP_INITIALIZED = 'APP_INITIALIZED'
export const ARCHIVE_HORSE = 'ARCHIVE_HORSE'
export const GIVE_CARROT = 'GIVE_CARROT'
export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS'
export const CLEAR_ONE_NOTIFICATION = 'CLEAR_ONE_NOTIFICATION'
export const CHOOSE_RIDE_ATLAS_RIDE = 'CHOOSE_RIDE_ATLAS_RIDE'
export const CHOOSE_HORSE_TACK_COLOR = 'CHOOSE_HORSE_TACK_COLOR'
export const DEACTIVATE_HOOF_TRACKS = 'DEACTIVATE_HOOF_TRACKS'
export const DELETE_CARE_EVENT = 'DELETE_CARE_EVENT'
export const DISABLE_GPS_SOUND_ALERTS = 'DISABLE_GPS_SOUND_ALERTS'
export const DISCARD_EMPTY_RIDE = 'DISCARD_EMPTY_RIDE'
export const DISCARD_NEW_RIDE = 'DISCARD_NEW_RIDE'
export const DO_USER_LOGOUT = 'DO_USER_LOGOUT'
export const DUPLICATE_RIDE_TO_ANOTHER_USER = 'DUPLICATE_RIDE_TO_ANOTHER_USER'
export const EDIT_RIDE = 'EDIT_RIDE'
export const DELETE_RIDE = 'DELETE_RIDE'
export const FINISH_RIDE = 'FINISH_RIDE'
export const HIT_LOG_OUT = 'HIT_LOG_OUT'
export const MAKE_RIDES_DEFAULT_PRIVATE = 'MAKE_RIDES_DEFAULT_PRIVATE'
export const MARK_RIDE_PRIVATE_LAND = 'MARK_RIDE_PRIVATE_LAND'
export const MARK_RIDE_PUBLIC_LAND = 'MARK_RIDE_PUBLIC_LAND'
export const OPEN_BARN = 'OPEN_BARN'
export const OPEN_CARE_CALENDAR = 'OPEN_CARE_CALENDAR'
export const OPEN_FEEDBACK = 'OPEN_FEEDBACK'
export const OPEN_FIND_FRIENDS = 'OPEN_FIND_FRIENDS'
export const OPEN_LEADERBOARDS = 'OPEN_LEADERBOARDS'
export const OPEN_MY_ACCOUNT = 'OPEN_MY_ACCOUNT'
export const OPEN_NOTIFICATIONS = 'OPEN_NOTIFICATIONS'
export const OPEN_SETTINGS = 'OPEN_SETTINGS'
export const OPEN_TRAINING_PAGE = 'OPEN_TRAINING_PAGE'
export const OPT_OUT_OF_LEADERBOARDS = 'OPT_OUT_OF_LEADERBOARDS'
export const PAUSE_RIDE = 'PAUSE_RIDE'
export const PULL_DOWN_FOR_SYNC = 'PULL_DOWN_FOR_SYNC'
export const RESET_HOOF_TRACKS_CODE = 'RESET_HOOF_TRACKS_CODE'
export const RESUME_PAUSED_RIDE = 'RESUME_PAUSED_RIDE'
export const RIDE_ANOTHER_USERS_HORSE = 'RIDE_ANOTHER_USERS_HORSE'
export const SAVE_RIDE = 'SAVE_RIDE'
export const SAVE_RIDE_TO_ATLAS = 'SAVE_RIDE_TO_ATLAS'
export const SEND_SHARE_RIDE = 'SEND_SHARE_RIDE'
export const SET_SINGLE_RIDE_TO_PRIVATE = 'SET_SINGLE_RIDE_TO_PRIVATE'
export const SHARE_HOOF_TRACKS_CODE = 'SHARE_HOOF_TRACKS_CODE'
export const SIGN_IN = 'SIGN_IN'
export const SIGN_UP = 'SIGN_UP'
export const SKIP_FIRST_START_FOREVER = 'SKIP_FIRST_START_FOREVER'
export const START_FOLLOWING_SOMEONE = 'START_FOLLOWING_SOMEONE'
export const START_SHARE_RIDE = 'START_SHARE_RIDE'
export const START_OR_CONTINUE_RIDE = 'START_OR_CONTINUE_RIDE'
export const SAVE_NEW_RIDE = 'SAVE_NEW_RIDE'
export const SWITCH_MAP_TYPE = 'SWITCH_MAP_TYPE'
export const TAKE_GEOTAGGED_PHOTO = 'TAKE_GEOTAGGED_PHOTO'
export const TRANSFER_HORSE_TO_NEW_USER = 'TRANSFER_HORSE_TO_NEW_USER'
export const TRIM_RIDE = 'TRIM_RIDE'
export const TURN_ON_DISTANCE_ALERTS = 'TURN_ON_DISTANCE_ALERTS'
export const TURN_OFF_RIDE_ATLAS_RIDE = 'TURN_OFF_RIDE_ATLAS_RIDE'
export const UPDATE_DEFAULT_HORSE = 'UPDATE_DEFAULT_HORSE'
export const UPDATE_GAIT_SPEEDS = 'UPDATE_GAIT_SPEEDS'
export const VIEW_NOTIFICATION_RIDE = 'VIEW_NOTIFICATION_RIDE'
export const VIEW_HORSE_PROFILE = 'VIEW_HORSE_PROFILE'
export const VIEW_RIDE_CHARTS = 'VIEW_RIDE_CHARTS'
export const VIEW_USER_PROFILE = 'VIEW_USER_PROFILE'

amplitude.getInstance().init(config.AMPLITUDE_TOKEN, null, {
  useNativeDeviceInfo: true
})

export default class AmplitudeService {
  static setUserID (id) {
    if (config.ENV !== 'local') {
      amplitude.getInstance().setUserId(id)
    }

  }

  static logEvent (eventName, data) {
    if (config.ENV !== 'local') {
      amplitude.getInstance().logEvent(eventName, data)
    }
  }
}