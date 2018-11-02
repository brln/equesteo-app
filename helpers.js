import { Map } from 'immutable'
import moment from 'moment'
import { Platform } from 'react-native'

import { simplifyLine } from './services/DouglasPeucker'

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

export const bearing = (lat1,lng1,lat2,lng2) => {
  let dLon = toRad(lng2-lng1);
  let y = Math.sin(dLon) * Math.cos(toRad(lat2));
  let x = Math.cos(toRad(lat1))*Math.sin(toRad(lat2)) - Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(dLon);
  let brng = toDeg(Math.atan2(y, x));
  return ((brng + 360) % 360);
}

export const unixTimeNow = () => {
  return Math.floor(new Date().getTime())
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
export function generateUUID () { // Public Domain/MIT
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function urlParams (params) {
  return Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&')
}

export function staticMap (ride) {
  const ROOT_URL = 'https://maps.googleapis.com/maps/api/staticmap?'
  const queryStringParams = {
      size: '600x400',
      format: 'png',
      maptype: 'terrain',
  }
  const pathStyle = 'color:0xff0000ff|weight:5'

  let tolerance = 0.00025
  let lengthURL = false
  let fullURL
  while (!lengthURL || lengthURL > 6000) {
    const simplified = simplifyLine(tolerance, ride.rideCoordinates)
    let pathCoords = ''
    for (let coord of simplified) {
      const parsed = parseRideCoordinate(coord)
      const parsedLat = parsed.get('latitude').toString()
      const parsedLong = parsed.get('longitude').toString()
      pathCoords += `|${parsedLat},${parsedLong}`
    }

    queryStringParams['path'] = pathStyle + pathCoords
    const queryString = urlParams(queryStringParams)
    fullURL = ROOT_URL + queryString
    lengthURL = fullURL.length
    tolerance += 0.000001
  }
  return fullURL
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

export function goodConnection(type, effectiveType) {
  return (type === connectionType.wifi || (
    type === connectionType.cellular && (effectiveType === effectiveConnectionType.fourG)
  ))
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
  return new Date(d.getFullYear(), 1, 1)
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

export function logError (error) {
  console.log(error)
}

export function logInfo (info) {
  console.log(info)
}

export function logDebug (info, title) {
  console.log(`======================= ${title} ===========================`)
  console.log(info)
  console.log(`=================== end ${title} ===========================`)
}

export function logRender (componentName) {
  logInfo('rendering: ' + componentName)
}

export function isAndroid () {
  return Platform.OS === 'android'
}

export function toElevationKey (coord) {
  return coord.toFixed(4)
}

export function metersToFeet(meters) {
  return meters * 3.28084
}

export function elapsedTime (startTime, currentTime, pausedTime, lastPauseStart) {
  let nowPausedTime = 0
  if (lastPauseStart) {
    nowPausedTime = moment(currentTime).diff(moment(lastPauseStart), 'seconds', true)
  }
  const totalElapsed = moment(currentTime).diff(moment(startTime), 'seconds', true)
  const withoutOldPauses = totalElapsed - pausedTime
  return withoutOldPauses - nowPausedTime
}

function leftPad(num) {
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
