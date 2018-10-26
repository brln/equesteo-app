import { List, Map } from 'immutable'

import {
  CLEAR_LAST_LOCATION,
  CLEAR_PAUSED_LOCATIONS,
  DISCARD_CURRENT_RIDE,
  LOAD_CURRENT_RIDE_STATE,
  MERGE_STASHED_LOCATIONS,
  NEW_LOCATION,
  PAUSE_LOCATION_TRACKING,
  REPLACE_LAST_LOCATION,
  RESUME_LOCATION_TRACKING,
  RIDE_CREATED,
  STASH_NEW_LOCATIONS,
  STOP_STASH_NEW_LOCATIONS,
  START_RIDE,
  UNPAUSE_LOCATION_TRACKING,
} from '../constants'
import { haversine, toElevationKey, unixTimeNow } from '../helpers'

export const initialState = Map({
  currentRide: null,
  currentRideElevations: null,
  lastElevation: null,
  lastLocation: null,
  locationStashingActive: false,
  moving: false,
  stashedCoordinates: List(),
  refiningLocation: null,
})

export default function CurrentRideReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_LAST_LOCATION:
      return state.set('lastLocation', null).set('refiningLocation', null)
    case CLEAR_PAUSED_LOCATIONS:
      return state.set('stashedCoordinates', List())
    case DISCARD_CURRENT_RIDE:
      return state.set('currentRide', null)
    case LOAD_CURRENT_RIDE_STATE:
      return action.currentRideState
    case PAUSE_LOCATION_TRACKING:
      return state.setIn(
        ['currentRide', 'lastPauseStart'],
        unixTimeNow()
      )
    case MERGE_STASHED_LOCATIONS:
      const rideCoordinates = state.getIn(
        ['currentRide', 'rideCoordinates']
      )
      const pausedCoordinates = state.get('stashedCoordinates')
      const merged = rideCoordinates.concat(pausedCoordinates)
      return state.setIn(
        ['currentRide', 'rideCoordinates'],
        merged
      ).set('stashedCoordinates', List())
    case NEW_LOCATION:
      const newState = state.set(
        'lastLocation', action.location
      ).set(
        'refiningLocation',
        action.location
      ).set(
        'lastElevation',
        action.elevation
      )
      const currentRide = state.get('currentRide')
      const currentElevations = state.get('currentRideElevations')
      const currentlyStashing = state.get('locationStashingActive')

      if (currentRide && currentElevations && !currentRide.get('lastPauseStart') && !currentlyStashing) {
        let newDistance = 0
        let elevationGain = 0
        const lastLocation = state.get('lastLocation')
        const lastElevation = state.get('lastElevation')
        if (lastLocation && lastElevation) {
          newDistance = haversine(
            lastLocation.get('latitude'),
            lastLocation.get('longitude'),
            action.location.get('latitude'),
            action.location.get('longitude')
          )
          const elevationChange = action.elevation.get('elevation') - lastElevation.get('elevation')
          elevationGain = elevationChange >= 0 ? elevationChange : 0
        }
        const rideCoordinates = state.getIn(
          ['currentRide', 'rideCoordinates']
        ).push(
          action.location
        ).sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        const totalDistance = currentRide.get('distance') + newDistance
        const totalElevationGain = currentElevations.get('elevationGain') + elevationGain
        const newCurrentRide = currentRide.merge(Map({
          rideCoordinates,
          distance: totalDistance,
        }))
        const newRideElevations =
          currentElevations.set(
            'elevationGain',
            totalElevationGain
          ).setIn([
              'elevations',
              toElevationKey(action.elevation.get('latitude')),
              toElevationKey(action.elevation.get('longitude')),
            ], action.elevation.get('elevation')
          )
        return newState.set(
          'currentRide',
          newCurrentRide
        ).set(
          'currentRideElevations',
          newRideElevations
        )
      } else if (currentRide && currentlyStashing) {
        const newRideElevations =
          currentElevations.setIn(
            ['elevations',
              toElevationKey(action.elevation.get('latitude')),
              toElevationKey(action.elevation.get('longitude')),
            ], action.elevation.get('elevation')
          )
        const stashedCoordinates = state.get(
          'stashedCoordinates'
        ).push(
          action.location
        ).sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })
        return newState.set(
          'stashedCoordinates',
          stashedCoordinates
        ).set(
          'currentRideElevations',
          newRideElevations
        )
      } else {
        return newState
      }
    case REPLACE_LAST_LOCATION:
      const oldLastLocation = state.get('lastLocation')
      let replacedLastLocation = state.set(
       'lastLocation',
        action.newLocation
      ).set(
        'lastElevation',
        action.newElevation
      )
      const currentRide1 = state.get('currentRide')
      if (currentRide1 && !currentRide1.get('lastPauseStart')) {
        const rideCoords = currentRide1.get('rideCoordinates')
        if (rideCoords.count() === 1) {
          return replacedLastLocation.setIn(
            ['currentRideElevations', 'elevationGain'],
            0
          ).setIn(
            ['currentRideElevations', 'elevations'],
            Map()
          ).setIn([
              'currentRideElevations',
              'elevations',
              toElevationKey(action.newElevation.get('latitude')),
              toElevationKey(action.newElevation.get('longitude'))
            ], action.newElevation.get('elevation')
          ).setIn(
            ['currentRide', 'rideCoordinates'],
            List().push(action.newLocation)
          )
        } else if (rideCoords.count() > 1 && oldLastLocation) {
          const rideElevations = state.getIn(['currentRideElevations', 'elevations'])
          const oldElevationTotalGain = state.getIn(['currentRideElevations', 'elevationGain'])
          const lastCoord = rideCoords.get(-2)
          const oldDistance = haversine(
            oldLastLocation.get('latitude'),
            oldLastLocation.get('longitude'),
            lastCoord.get('latitude'),
            lastCoord.get('longitude')
          )
          const lastElevation = rideElevations.get(
            toElevationKey(lastCoord.get('latitude'))
          ).get(
            toElevationKey(lastCoord.get('longitude'))
          )
          const oldLastElevation = rideElevations.get(
            toElevationKey(oldLastLocation.get('latitude'))
          ).get(
            toElevationKey(oldLastLocation.get('longitude'))
          )
          const newDistance = haversine(
            lastCoord.get('latitude'),
            lastCoord.get('longitude'),
            action.newLocation.get('latitude'),
            action.newLocation.get('longitude')
          )
          const oldElevationChange = oldLastElevation - lastElevation
          const oldElevationGain = oldElevationChange >= 0 ? oldElevationChange : 0

          const newElevationChange = action.newElevation.get('elevation') - lastElevation
          const newElevationGain = newElevationChange >= 0 ? newElevationChange : 0
          const newRideCoordinates = replacedLastLocation.getIn(
            ['currentRide', 'rideCoordinates']
          ).pop().push(
            action.newLocation
          ).sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
          })

          const totalDistance = currentRide1.get('distance')
            - oldDistance
            + newDistance
          const totalChange = oldElevationTotalGain - oldElevationGain + newElevationGain
          return replacedLastLocation.setIn(
            ['currentRide', 'distance'],
            totalDistance
          ).setIn(
            ['currentRide', 'rideCoordinates'],
            newRideCoordinates
          ).setIn(
            ['currentRideElevations', 'elevationGain'],
            totalChange
          ).setIn(
            [
              'currentRideElevations',
              'elevations',
              toElevationKey(action.newElevation.get('latitude')),
              toElevationKey(action.newElevation.get('longitude')),
            ],
            action.newElevation.get('elevation')
          )
        }
      }
      return replacedLastLocation
    case RESUME_LOCATION_TRACKING:
      return state.set('locationStashingActive', false)
    case RIDE_CREATED:
      return state.set('currentRide', null)
    case START_RIDE:
      return state.set(
        'currentRide',
        action.currentRide
      ).set(
        'currentRideElevations',
        action.currentElevations
      )
    case STASH_NEW_LOCATIONS:
      return state.set('locationStashingActive', true)
    case STOP_STASH_NEW_LOCATIONS:
      return state.set('locationStashingActive', false)
    case UNPAUSE_LOCATION_TRACKING:
      const lastPauseStart = state.getIn(['currentRide', 'lastPauseStart'])
      const oldPausedTime = state.getIn(['currentRide', 'pausedTime'])
      const elapsed = (unixTimeNow() / 1000) - (lastPauseStart / 1000)
      const newPausedTime = oldPausedTime + elapsed
      return state.setIn(
        ['currentRide', 'lastPauseStart'],
        null
      ).setIn(
        ['currentRide', 'pausedTime'],
        newPausedTime
      )
    default:
      return state
  }
}
