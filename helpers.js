import moment from 'moment'
import { Platform } from 'react-native'

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
  return R * c;
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
  const toSimplify = ride.rideCoordinates.map((coord) => {
    return {
      lat: coord.get('latitude'),
      lng: coord.get('longitude')
    }
  }).toJS()

  let tolerance = 0.00006
  let lengthURL = false
  let fullURL
  while (!lengthURL || lengthURL > 6000) {
    const simplified = simplifyLine(tolerance, toSimplify)
    let pathCoords = ''
    for (let coord of simplified) {
      const parsedLat = coord.lat.toString()
      const parsedLong = coord.lng.toString()
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

function simplifyLine (tolerance, points) {
  // stolen from https://gist.github.com/adammiller/826148
  let res = null;

  if(points.length){
    class Line {
      constructor(p1, p2 ) {
        this.p1 = p1;
        this.p2 = p2;
      }

      distanceToPoint ( point ) {
        // slope
        let m = ( this.p2.lat - this.p1.lat ) / ( this.p2.lng - this.p1.lng ),
          // y offset
          b = this.p1.lat - ( m * this.p1.lng ),
          d = [];
        // distance to the linear equation
        d.push( Math.abs( point.lat - ( m * point.lng ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
        // distance to p1
        d.push( Math.sqrt( Math.pow( ( point.lng - this.p1.lng ), 2 ) + Math.pow( ( point.lat - this.p1.lat ), 2 ) ) );
        // distance to p2
        d.push( Math.sqrt( Math.pow( ( point.lng - this.p2.lng ), 2 ) + Math.pow( ( point.lat - this.p2.lat ), 2 ) ) );
        // return the smallest distance
        return d.sort( function( a, b ) {
          return ( a - b ); //causes an array to be sorted numerically and ascending
        } )[0];
      };
    };

    let douglasPeucker = function( points, tolerance ) {
      if ( points.length <= 2 ) {
        return [points[0]];
      }
      let returnPoints = [],
        // make line from start to end
        line = new Line( points[0], points[points.length - 1] ),
        // find the largest distance from intermediate points to this line
        maxDistance = 0,
        maxDistanceIndex = 0,
        p;
      for( let i = 1; i <= points.length - 2; i++ ) {
        let distance = line.distanceToPoint( points[ i ] );
        if( distance > maxDistance ) {
          maxDistance = distance;
          maxDistanceIndex = i;
        }
      }
      // check if the max distance is greater than our tolerance allows
      if ( maxDistance >= tolerance ) {
        p = points[maxDistanceIndex];
        line.distanceToPoint( p, true );
        // include this point in the output
        returnPoints = returnPoints.concat(
          douglasPeucker(
            points.slice(
              0,
              maxDistanceIndex + 1
            ),
            tolerance
          )
        )
        // returnPoints.push( points[maxDistanceIndex] );
        returnPoints = returnPoints.concat(
          douglasPeucker(
            points.slice(
              maxDistanceIndex,
              points.length
            ),
            tolerance
          )
        );
      } else {
        // ditching this point
        p = points[maxDistanceIndex];
        line.distanceToPoint( p, true );
        returnPoints = [points[0]];
      }
      return returnPoints;
    };
    res = douglasPeucker( points, tolerance );
    // always have to push the very last point on so it doesn't get left off
    res.push( points[points.length - 1 ] );
  }
  return res;
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
    type === connectionType.cellular && (
      effectiveType === effectiveConnectionType.threeG || effectiveConnectionType.fourG
    )
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

export function logRender (componentName) {
  console.log('rendering: ' + componentName)
}

export function isAndroid () {
  return Platform.OS === 'android'
}
