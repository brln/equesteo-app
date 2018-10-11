import { Map } from 'immutable'

// const MIN_ACCURACY = 1
//
// class KalmanLatLong {
//   constructor(Q_metres_per_second) {
//     this.Q_metres_per_second = Q_metres_per_second;
//     this.variance = -1;
//
//     this.Q_metres_per_second = null
//     this.TimeStamp_milliseconds;
//     this.lat;
//     this.lng;
//     this.variance;
//   }
//
//   Process(lat_measurement, lng_measurement, accuracy, TimeStamp_milliseconds) {
//     if (accuracy < MIN_ACCURACY) {
//       accuracy = MIN_ACCURACY
//     }
//     if (this.variance < 0) {
//       // if variance < 0, object is unitialised, so initialise with current values
//       this.TimeStamp_milliseconds = TimeStamp_milliseconds;
//       lat=lat_measurement; lng = lng_measurement; variance = accuracy*accuracy;
//     } else {
//       // else apply Kalman filter methodology
//
//       long TimeInc_milliseconds = TimeStamp_milliseconds - this.TimeStamp_milliseconds;
//       if (TimeInc_milliseconds > 0) {
//         // time has moved on, so the uncertainty in the current position increases
//         variance += TimeInc_milliseconds * Q_metres_per_second * Q_metres_per_second / 1000;
//         this.TimeStamp_milliseconds = TimeStamp_milliseconds;
//         // TO DO: USE VELOCITY INFORMATION HERE TO GET A BETTER ESTIMATE OF CURRENT POSITION
//       }
//
//       // Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
//       // NB: because K is dimensionless, it doesn't matter that variance has different units to lat and lng
//       float K = variance / (variance + accuracy * accuracy);
//       // apply K
//       lat += K * (lat_measurement - lat);
//       lng += K * (lng_measurement - lng);
//       // new Covarariance  matrix is (IdentityMatrix - K) * Covarariance
//       variance = (1 - K) * variance;
//     }
//   }
//
// }

export default function kalmanFilter (point, lastPoint, Q) { //lat_measurement, lng_measurement, accuracy, TimeStamp_milliseconds) {
  let variance = lastPoint.get('accuracy') * lastPoint.get('accuracy')
  const timeDiff = point.get('timestamp') - lastPoint.get('timestamp')
  if (timeDiff > 0) {
    variance += timeDiff * Q * Q / 1000;
  }
  const K = variance / (variance + point.get('accuracy') * point.get('accuracy'));
  return Map({
    provider: point.get('provider'),
    timestamp: point.get('timestamp'),
    latitude: lastPoint.get('latitude') + K * (point.get('latitude') - lastPoint.get('latitude')),
    longitude: lastPoint.get('longitude') + K * (point.get('longitude') - lastPoint.get('longitude')),
    accuracy: Math.sqrt((1 - K) * variance)
  })

}
