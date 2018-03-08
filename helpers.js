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

export const bearing = (lat1, lng1, lat2, lng2) => {
  const dLon = (lng2-lng1);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  return 360 - ((brng + 360) % 360);
}
