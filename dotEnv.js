import { Platform } from 'react-native'
import {
  amplitude_token,
  api_url_ios,
  api_url_android,
  distribution,
  env,
  release,
  mapbox_token,
  nicole_user_id,
  static_maps_api_key,
  sentry_dsn_android,
  sentry_dsn_ios,
} from 'react-native-dotenv'

export const API_URL = Platform.select({ios: api_url_ios, android: api_url_android})
export const SENTRY_DSN = Platform.select({ios: sentry_dsn_ios, android: sentry_dsn_android})

export const AMPLITUDE_TOKEN = amplitude_token
export const ENV = env
export const RELEASE = release
export const DISTRIBUTION = distribution
export const MAPBOX_TOKEN = mapbox_token
export const NICOLE_USER_ID = nicole_user_id
