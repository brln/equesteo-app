import { Platform } from 'react-native'
import {
  api_url_ios,
  api_url_android,
  env,
  static_maps_api_key,
  sentry_dsn,
  release,
  distribution,
  mapbox_token,
  mixpanel_token,
} from 'react-native-dotenv'

const API_URL_IOS = api_url_ios
const API_URL_ANDROID = api_url_android
export const API_URL = Platform.select({ios: api_url_ios, android: api_url_android})

export const ENV = env
export const SENTRY_DSN = sentry_dsn
export const RELEASE = release
export const DISTRIBUTION = distribution
export const MAPBOX_TOKEN = mapbox_token
export const MIXPANEL_TOKEN = mixpanel_token
