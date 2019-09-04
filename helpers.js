import { List, Map } from 'immutable'
import moment from 'moment'
import mbxStatic from '@mapbox/mapbox-sdk/services/static'
import { Platform } from 'react-native'


import config from './dotEnv'

export const DEFAULT_HORSE_SPEEDS = Map({
  walk: List([0, 6]),
  trot: List([6, 12]),
  canter: List([12, 25]),
  gallop: List([25, 30]),
})


const toRad = (deg) => {
  return deg * Math.PI / 180;
}

const toDeg = (rad) => {
  return rad * 180 / Math.PI
}


export const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // mi
  const x1 = lat2 - lat1
  const dLat = toRad(x1)
  const x2 = lon2 - lon1
  const dLon = toRad(x2)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(6));
}

export const heading = (lat1,lng1,lat2,lng2) => {
  let dLon = toRad(lng2-lng1);
  let y = Math.sin(dLon) * Math.cos(toRad(lat2));
  let x = Math.cos(toRad(lat1))*Math.sin(toRad(lat2)) - Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(dLon);
  let brng = toDeg(Math.atan2(y, x));
  return ((brng + 360) % 360);
}

export const unixTimeNow = () => {
  return Math.floor(new Date().getTime())
}

export const unixTimeFromStamp = (stamp) => {
  return Math.floor(new Date(stamp).getTime())
}

export const profilePhotoURL = (id) => {
  return `https://equesteo-profile-photos-2.s3.amazonaws.com/${id}.jpg`
}

export const horsePhotoURL = (id) => {
  return `https://equesteo-horse-photos.s3.amazonaws.com/${id}.jpg`
}

export const ridePhotoURL = (id) => {
  return `https://equesteo-ride-photos-2.s3.amazonaws.com/${id}.jpg`
}

// from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function generateUUID () {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    })
}

export function staticMap (ride, coordinateData) {
  const staticService = mbxStatic({accessToken: config.MAPBOX_TOKEN})
  const parsed = coordinateData.reduce((accum, coord) => {
    const decoded = parseRideCoordinate(coord)
    accum.push([decoded.get('longitude'), decoded.get('latitude')])
    return accum
  }, [])
  const request = staticService.getStaticImage({
    ownerId: 'equesteo',
    styleId: 'cjn3zysq408tc2sk1g1gunqmq',
    width: 600,
    height: 400,
    position: 'auto',
    overlays: [{
      path: {
        strokeWidth: 5,
        strokeColor: 'ea5b60',
        coordinates: parsed
      }
    }]
  })
  return request.url()
}

export const connectionType = {
  none: 'none',
  wifi: 'wifi',
  cellular: 'cellular',
  unknown: 'unknown',
  bluetooth: 'bluetooth',
  ethernet: 'ethernet',
  wimax: 'wimax',
}

export const effectiveConnectionType = {
  twoG: '2g',
  threeG: '3g',
  fourG: '4g',
  unknown: 'unknown'
}

export const appStates = {
  active: 'active',
  background: 'background',
  inactive: 'inactive'
}

export function goodConnection(type, effectiveType, useOnlyWifi) {
  return (type === connectionType.wifi
    || (
      type === connectionType.cellular
      && effectiveType === effectiveConnectionType.fourG
      && !useOnlyWifi
    )
  )
}

export function getMonday (d) {
  d = new Date(d);
  d.setHours(0, 0, 0, 0)
  let day = d.getDay()
  let diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff))
}

export function getFirstOfMonth (d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getFirstOfYear (d) {
  return new Date(d.getFullYear(), 0, 1)
}

export function formattedWeekString(monday) {
  const start = moment(new Date(monday))
  const startString = start.format('MMMM D')
  let end = moment(start).add(6, 'days')
  let endString = end.format('D YYYY')
  if (start.month() !== end.month()) {
    endString = end.format('MMMM D YYYY')
  }
  return `${startString} - ${endString}`
}

export function newRideName (currentRide) {
  let name
  const hour = (new Date(currentRide.get('startTime'))).getHours()
  if (hour < 5) {
    name = 'Early Morning Ride'
  } else if (hour < 10) {
    name = 'Morning Ride'
  } else if (hour < 14) {
    name = 'Lunch Ride'
  } else if (hour < 17) {
    name = 'Afternoon Ride'
  } else if (hour < 20) {
    name = 'Evening Ride'
  } else if (hour < 25 ) {
    name = 'Night Ride'
  }
  return name
}

export function logDebug (info, title) {
  console.log(`======================= ${title} ===========================`)
  console.log(info)
  console.log(`============================================================`)
}

export function logRender (componentName) {
  console.log('rendering: ' + componentName)
}

export function isAndroid () {
  return Platform.OS === 'android'
}

export function toElevationKey (coord) {
  return coord.toFixed(4)
}

export function metersToFeet (meters) {
  return meters * 3.28084
}

export function feetToMeters (feet) {
  return feet / 3.28084
}

export function elapsedTime (startTime, currentTime, pausedTime, lastPauseStart) {
  let nowPausedTime = 0
  if (lastPauseStart) {
    nowPausedTime = moment(currentTime).diff(moment(lastPauseStart), 'seconds', true)
  }
  const totalElapsed = moment(currentTime).diff(moment(startTime), 'seconds', true)
  const withoutOldPauses = totalElapsed - pausedTime
  const netElapsed = withoutOldPauses - nowPausedTime
  return netElapsed < 0 ? 0 : netElapsed
}

export function leftPad (num) {
  const str = num.toString()
  const pad = "00"
  return pad.substring(0, pad.length - str.length) + str
}

export function timeToString (elapsed) {
  const asHours = elapsed / 60 / 60
  const justHours = Math.floor(asHours)
  const minutes = (asHours - justHours) * 60
  const justMinutes = Math.floor(minutes)
  const seconds = (minutes - justMinutes) * 60
  const roundedSeconds = Math.round(seconds)
  return `${leftPad(justHours)}:${leftPad(justMinutes)}:${leftPad(roundedSeconds)}`
}

export const MONTHS = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
}

export function parseRideCoordinate (fromDB) {
  return Map({
    latitude: fromDB.get(0),
    longitude: fromDB.get(1),
    timestamp: fromDB.get(2),
    accuracy: fromDB.get(3)
  })
}

export function boundingBox (rideCoordinates) {
  const asJS = rideCoordinates.toJS()
  const firstCoord = asJS[0]

  const initialVal = [[firstCoord[1], firstCoord[0]], [firstCoord[1], firstCoord[0]]]
  return asJS.reduce((accum, coord) => {
    if (coord[0] > accum[0][1]) {
      accum[0][1] = coord[0]
    }
    if (coord[1] > accum[0][0]) {
      accum[0][0] = coord[1]
    }
    if (coord[0] < accum[1][1]) {
      accum[1][1] = coord[0]
    }
    if (coord[1] < accum[1][0]) {
      accum[1][0] = coord[1]
    }
    return accum
  }, initialVal)
}

export function speedGradient (speed) {
  switch (Math.floor(speed)) {
    case 0:
      return "#5A35DE"
    case 1:
      return "#5A35DE"
    case 2:
      return "#6532CD"
    case 3:
      return "#712FBC"
    case 4:
      return "#7D2CAB"
    case 5:
      return "#88299A"
    case 6:
      return "#942689"
    case 7:
      return "#A02378"
    case 8:
      return "#AB2066"
    case 9:
      return "#B71D56"
    case 10:
      return "#C31A45"
    case 11:
      return "#CE1733"
    case 12:
      return "#DA1423"
    case 13:
      return "#E61212"
    case 14:
      return "#E62317"
    case 15:
      return "#E6341C"
    case 16:
      return "#E74521"
    case 17:
      return "#E75727"
    case 18:
      return "#E7682C"
    case 19:
      return "#E87931"
    case 20:
      return "#E88A36"
    case 21:
      return "#E89C3C"
    case 22:
      return "#E9AD41"
    case 23:
      return "#E9BE46"
    case 24:
      return "#E9CF4B"
    default:
      return "#EAE151"
  }
}

// from https://stackoverflow.com/questions/21034924/lighten-hex-code-in-javascript
export function shade(col, light) {
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);
    if (light < 0) {
        r = (1 + light) * r;
        g = (1 + light) * g;
        b = (1 + light) * b;
    } else {
        r = (1 - light) * r + light * 255;
        g = (1 - light) * g + light * 255;
        b = (1 - light) * b + light * 255;
    }
    return color(r, g, b);
}

function hex2(c) {
    c = Math.round(c);
    if (c < 0) c = 0;
    if (c > 255) c = 255;
    var s = c.toString(16);
    if (s.length < 2) s = "0" + s;
    return s;
}

function color(r, g, b) {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}
// end from

export function newElevationGain (distance, lastElevation, newElevation, oldTotal) {
  let newTotal = oldTotal
  const diff = metersToFeet(Math.abs(newElevation - lastElevation))
  if (diff) {
    const grade = diff / (distance * 5280)
    if (grade < 0.5) {
      const elevationChange = newElevation - lastElevation
      newTotal = oldTotal + (elevationChange > 0 ? elevationChange : 0)
    }
  }
  return newTotal
}

export function parseElevationData (rideCoordinates, rideElevations) {
  let totalDistance = 0
  let totalGain = 0
  let lastPoint = null
  let points = []
  let oldTotalGain = null

  for (let rideCoord of rideCoordinates) {
    const parsedCoord = parseRideCoordinate(rideCoord)
    const elevation = rideElevations.getIn([
      toElevationKey(parsedCoord.get('latitude')),
      toElevationKey(parsedCoord.get('longitude'))
    ])
    if (!lastPoint) {
      lastPoint = parsedCoord
      points.push({
        distance: 0,
        gain: 0,
        elevation: metersToFeet(elevation),
      })
    } else {
      const newDistance = haversine(
        lastPoint.get('latitude'),
        lastPoint.get('longitude'),
        parsedCoord.get('latitude'),
        parsedCoord.get('longitude')
      )
      totalDistance += newDistance
      const lastElevation = rideElevations.getIn([
        toElevationKey(lastPoint.get('latitude')),
        toElevationKey(lastPoint.get('longitude'))
      ])
      totalGain = newElevationGain(newDistance, lastElevation, elevation, totalGain)
      if (elevation !== undefined && totalDistance !== undefined && totalGain !== undefined) {
        points.push({
          elevation: metersToFeet(elevation),
          distance: totalDistance,
          gain: metersToFeet(totalGain)
        })
        oldTotalGain = totalGain
        lastPoint = parsedCoord
      }
    }
  }
  return points
}

export function coordSplice (rideCoords, trimValues) {
  const cloned = [...rideCoords]
  const lengthFirstSplice = trimValues[0]
  const lengthSecondSplice = rideCoords.length - trimValues[1] - 1
  cloned.splice(0, lengthFirstSplice)
  cloned.splice(trimValues[1] - lengthFirstSplice + 1, lengthSecondSplice)
  return cloned
}

export function addDays (date, days) {
  let dat = new Date(date.valueOf())
  dat.setDate(dat.getDate() + days);
  return dat;
}

export function dateArray (startDate, stopDate) {
  let dateArray = []
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
}

export function rideIDGenerator (userID) {
  return `${userID.toString()}_${(new Date).getTime().toString()}`
}
