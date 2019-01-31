import { List, Map } from 'immutable'

import {
  CLEAR_STATE,
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
import {
  haversine,
  newElevationGain,
  parseRideCoordinate,
  toElevationKey,
  unixTimeNow
} from '../helpers'

export const initialState = Map({
  currentRide: null,
  currentRideCoordinates: null,
  currentRideElevations: null,
  lastElevation: null,
  lastLocation: null,
  locationStashingActive: false,
  moving: false,
  nullMapLocation: null,
  stashedCoordinates: List(),
  refiningLocation: null,
})

export default function CurrentRideReducer(state=initialState, action) {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState
    case CLEAR_LAST_LOCATION:
      return state.set('lastLocation', null).set('refiningLocation', null)
    case CLEAR_PAUSED_LOCATIONS:
      return state.set('stashedCoordinates', List())
    case DISCARD_CURRENT_RIDE:
      return state.set(
        'currentRide', null
      ).set(
        'currentRideCoordinates', null
      ).set(
        'currentRideElevations', null
      )
    case LOAD_CURRENT_RIDE_STATE:
      return action.currentRideState
    case PAUSE_LOCATION_TRACKING:
      return state.setIn(
        ['currentRide', 'lastPauseStart'],
        unixTimeNow()
      )
    case MERGE_STASHED_LOCATIONS:
      const rideCoordinates = state.getIn(['currentRideCoordinates', 'rideCoordinates'])
      const pausedCoordinates = state.get('stashedCoordinates')
      const merged = rideCoordinates.concat(pausedCoordinates).sort((a, b) => {
        return new Date(a.get(2)) - new Date(b.get(2));
      })
      return state.setIn(
        ['currentRideCoordinates', 'rideCoordinates'],
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
      ).set(
        'nullMapLocation',
        List([action.location.get('longitude'), action.location.get('latitude')])
      )
      const currentRide = state.get('currentRide')
      const currentElevations = state.get('currentRideElevations')
      const currentCoordinates = state.get('currentRideCoordinates')
      const currentlyStashing = state.get('locationStashingActive')
      const permaCoord = List([
        Number(action.location.get('latitude').toFixed(6)),
        Number(action.location.get('longitude').toFixed(6)),
        action.location.get('timestamp'),
        Number(action.location.get('accuracy').toFixed(2))
      ])
      const usablePermaCoord = parseRideCoordinate(permaCoord)

      if (currentRide
        && currentCoordinates
        && currentElevations
        && !currentRide.get('lastPauseStart')
        && !currentlyStashing
      ) {
        let newDistance = 0
        let elevationGain = 0
        const lastLocation = state.get('lastLocation')
        const lastElevation = state.get('lastElevation')
        if (lastLocation && lastElevation) {
          newDistance = haversine(
            lastLocation.get('latitude'),
            lastLocation.get('longitude'),
            usablePermaCoord.get('latitude'),
            usablePermaCoord.get('longitude')
          )
          elevationGain = newElevationGain(
            newDistance,
            lastElevation.get('elevation'),
            action.elevation.get('elevation'),
            currentElevations.get('elevationGain')
          )
        }
        const rideCoordinates = currentCoordinates.get(
          'rideCoordinates'
        ).push(
          permaCoord
        ).sort((a, b) => {
          return new Date(a.get(2)) - new Date(b.get(2));
        })
        const totalDistance = currentRide.get('distance') + newDistance
        const newCurrentCoordinates = currentCoordinates.set('rideCoordinates', rideCoordinates)
        const newCurrentRide = currentRide.set('distance', totalDistance)
        const newRideElevations =
          currentElevations.set(
            'elevationGain',
            elevationGain
          ).setIn([
              'elevations',
              toElevationKey(usablePermaCoord.get('latitude')),
              toElevationKey(usablePermaCoord.get('longitude')),
            ], action.elevation.get('elevation')
          )
        return newState.set(
          'currentRide',
          newCurrentRide
        ).set(
          'currentRideElevations',
          newRideElevations
        ).set(
          'currentRideCoordinates',
          newCurrentCoordinates
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
          permaCoord
        ).sort((a, b) => {
          return new Date(a.get(2)) - new Date(b.get(2));
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
      let replacedLastLocation = state.set(
       'lastLocation',
        action.newLocation
      ).set(
        'lastElevation',
        action.newElevation
      )
      const currentRide1 = state.get('currentRide')
      const currentRideCoordinates1 = state.get('currentRideCoordinates')

      const permanentCoord = List([
        Number(action.newLocation.get('latitude').toFixed(6)),
        Number(action.newLocation.get('longitude').toFixed(6)),
        action.newLocation.get('timestamp'),
        Number(action.newLocation.get('accuracy').toFixed(2))
      ])
      const usablePermanentCoord = parseRideCoordinate(permanentCoord)

      if (currentRide1 && !currentRide1.get('lastPauseStart')) {
        const rideCoords = currentRideCoordinates1.get('rideCoordinates')
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
              toElevationKey(usablePermanentCoord.get('latitude')),
              toElevationKey(usablePermanentCoord.get('longitude'))
            ], action.newElevation.get('elevation')
          ).setIn(
            ['currentRideCoordinates', 'rideCoordinates'],
            List().push(permanentCoord)
          )
        } else if (rideCoords.count() > 1) {
          const rideElevations = state.getIn(['currentRideElevations', 'elevations'])
          const oldElevationTotalGain = state.getIn(['currentRideElevations', 'elevationGain'])
          const oldLastLocation = parseRideCoordinate(rideCoords.get(-1))
          const lastCoord = parseRideCoordinate(rideCoords.get(-2))
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
            usablePermanentCoord.get('latitude'),
            usablePermanentCoord.get('longitude')
          )
          const oldElevationChange = oldLastElevation - lastElevation
          const oldElevationGain = oldElevationChange >= 0 ? oldElevationChange : 0

          const totalGain = newElevationGain(
            newDistance,
            lastElevation,
            action.newElevation.get('elevation'),
            oldElevationTotalGain
          ) - oldElevationGain
          const newRideCoordinates = replacedLastLocation.getIn(
            ['currentRideCoordinates', 'rideCoordinates']
          ).pop().push(
            permanentCoord
          ).sort((a, b) => {
            return new Date(a.get(2)) - new Date(b.get(2));
          })

          const totalDistance = currentRide1.get('distance')
            - oldDistance
            + newDistance
          return replacedLastLocation.setIn(
            ['currentRide', 'distance'],
            totalDistance
          ).setIn(
            ['currentRideCoordinates', 'rideCoordinates'],
            newRideCoordinates
          ).setIn(
            ['currentRideElevations', 'elevationGain'],
            totalGain
          ).setIn(
            [
              'currentRideElevations',
              'elevations',
              toElevationKey(usablePermanentCoord.get('latitude')),
              toElevationKey(usablePermanentCoord.get('longitude')),
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
      const coords = []
      let elevations = Map()
      if (action.firstCoord) {
        const permanentCoord = List([
          Number(action.firstCoord.get('latitude').toFixed(6)),
          Number(action.firstCoord.get('longitude').toFixed(6)),
          action.firstCoord.get('timestamp'),
          Number(action.firstCoord.get('accuracy').toFixed(2))
        ])
        coords.push(permanentCoord)
        elevations = elevations.setIn([
          toElevationKey(action.firstElevation.get('latitude')),
          toElevationKey(action.firstElevation.get('longitude'))
        ], action.firstElevation.get('elevation'))
      }
      return state.set(
        'currentRide',
        Map({
          startTime: action.startTime,
          pausedTime: 0,
          lastPauseStart: null,
          distance: 0
        })
      ).set(
        'currentRideElevations',
        Map({
          elevationGain: 0,
          elevations
        })
      ).set(
        'currentRideCoordinates',
        Map({
          rideCoordinates: List(coords),
        })
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
