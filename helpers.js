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

export const rideCoordsToMapCoords = (rideCoords) => {
  const sorted = [...rideCoords].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  })

  return sorted.map((apiCoord) => {
    return {
      latitude: parseFloat(apiCoord.latitude),
      longitude: parseFloat(apiCoord.longitude),
    }
  })
}

export const unixTimeNow = () => {
  return Math.floor(new Date().getTime())
}

export const profilePhotoURL = (id) => {
  return `https://s3.amazonaws.com/equesteo-profile-photos/full_size/${id}.jpeg`
}

// from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function generateUUID () { // Public Domain/MIT
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function urlParams (params) {
  return Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&')
}

export function staticMap (ride) {
  const STATIC_MAPS_API_KEY = ' AIzaSyBhUmpq-7uQ2JaqtrHO3hpfeFHynVpo8xQ'
  const ROOT_URL = 'https://maps.googleapis.com/maps/api/staticmap?'
  const queryStringParams = {
      size: '400x400',
      format: 'png',
      maptype: 'terrain',
  }
  const pathStyle = 'color:0xff0000ff|weight:5'
  let pathCoords = ''
  for (let coordinate of ride.rideCoordinates) {
    pathCoords += `|${coordinate.latitude},${coordinate.longitude}`
  }

  queryStringParams['path'] = pathStyle + pathCoords
  queryStringParams['key'] = STATIC_MAPS_API_KEY
  const queryString = urlParams(queryStringParams)
  return ROOT_URL + queryString
}
