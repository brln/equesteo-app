// adapted from https://stackoverflow.com/questions/1134579/smooth-gps-data

const MIN_ACCURACY = 1

export default class KalmanLatLong {
  constructor(Q_metres_per_second) {
    this.Q_metres_per_second = Q_metres_per_second;
    this.variance = -1;

    this.TimeStamp_milliseconds = null
    this.lat = null
    this.lng = null
    this.variance = null
  }

  Process(lat_measurement, lng_measurement, accuracy, TimeStamp_milliseconds) {
    if (accuracy < MIN_ACCURACY) {
      accuracy = MIN_ACCURACY
    }
    if (this.variance < 0) {
      // if variance < 0, object is unitialised, so initialise with current values
      this.TimeStamp_milliseconds = TimeStamp_milliseconds;
      this.lat=lat_measurement;
      this.lng = lng_measurement;
      this.variance = accuracy * accuracy;
    } else {
      // else apply Kalman filter methodology

      const TimeInc_milliseconds = TimeStamp_milliseconds - this.TimeStamp_milliseconds;
      if (TimeInc_milliseconds > 0) {
        // time has moved on, so the uncertainty in the current position increases
        this.variance += TimeInc_milliseconds * this.Q_metres_per_second * this.Q_metres_per_second / 1000;
        this.TimeStamp_milliseconds = TimeStamp_milliseconds;
        // TO DO: USE VELOCITY INFORMATION HERE TO GET A BETTER ESTIMATE OF CURRENT POSITION
      }

      // Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
      // NB: because K is dimensionless, it doesn't matter that variance has different units to lat and lng
      const K = this.variance / (this.variance + accuracy * accuracy);
      // apply K
      this.lat += K * (lat_measurement - this.lat);
      this.lng += K * (lng_measurement - this.lng);
      // new Covarariance  matrix is (IdentityMatrix - K) * Covarariance
      this.variance = (1 - K) * this.variance;
      return {
        lat: this.lat,
        lng: this.lng
      }
    }
  }

}