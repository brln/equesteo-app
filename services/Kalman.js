import { Map } from 'immutable'

export default function kalmanFilter (point, lastPoint, Q) { //lat_measurement, lng_measurement, accuracy, TimeStamp_milliseconds) {
  let variance = lastPoint.get('accuracy') * lastPoint.get('accuracy')
  const timeDiff = point.get('timestamp') - lastPoint.get('timestamp')
  if (timeDiff > 0) {
    variance += timeDiff * Q * Q / 1000;
  }
  const K = variance / (variance + point.get('accuracy') * point.get('accuracy'));
  return Map({
    timestamp: point.get('timestamp'),
    speed: point.get('speed'),
    latitude: lastPoint.get('latitude') + K * (point.get('latitude') - lastPoint.get('latitude')),
    longitude: lastPoint.get('longitude') + K * (point.get('longitude') - lastPoint.get('longitude')),
    accuracy: Math.sqrt((1 - K) * variance)
  })

}
