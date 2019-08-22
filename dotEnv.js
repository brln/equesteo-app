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

export default {
  API_URL: Platform.select({ios: api_url_ios, android: api_url_android}),
  SENTRY_DSN: Platform.select({ios: sentry_dsn_ios, android: sentry_dsn_android}),
  RELEASE: Platform.select({ios: `com.equesteo.equesteo-${release}`, android: `com.equesteo-${release}`}),
  AMPLITUDE_TOKEN: amplitude_token,
  ENV: env,
  DISTRIBUTION: distribution,
  MAPBOX_TOKEN: mapbox_token,
  NICOLE_USER_ID: nicole_user_id,
}

