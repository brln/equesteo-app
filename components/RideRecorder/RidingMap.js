import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';

import {
  Image,
  StyleSheet,
  View
} from 'react-native';

import { bearing, logRender } from '../../helpers'

export default class RidingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    this.changeBearing = this.changeBearing.bind(this)
    this.fitToElements = this.fitToElements.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rideCoords.count() === 0 && this.props.rideCoords.count() === 1) {
      this.map.animateToRegion(this.fitToElements())
    }
    this.changeBearing()
  }

  fitToElements() {
    const lats = this.props.rideCoords.map(c => c.get('latitude'))
    const longs = this.props.rideCoords.map(c => c.get('longitude'))
    const maxLat = Math.max(...lats)
    const minLat = Math.min(...lats)
    const maxLong = Math.max(...longs)
    const minLong = Math.min(...longs)
    const latitude = ((maxLat - minLat) / 2) + minLat || 0
    const longitude = ((maxLong - minLong) / 2) + minLong || 0
    const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.01)
    const longitudeDelta = Math.max((maxLong - minLong) * 1.2, 0.01)
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    }

  }

  changeBearing () {
    let newBearing = 0
    let coordinates = this.props.rideCoords.toJS()
    const lastCoord = coordinates[coordinates.length -1]
    if (coordinates.length > 1) {
      newBearing = bearing(
        coordinates[coordinates.length - 2].latitude,
        coordinates[coordinates.length - 2].longitude,
        lastCoord.latitude,
        lastCoord.longitude
      )
      this.map.animateToNavigation(lastCoord, newBearing, 45)
    }
  }

  gpsStatusImage () {
    if (this.props.lastLocation) {
      switch (true) {
        case this.props.lastLocation.get('accuracy') < 10:
          return require('../../img/gps/gps5.png')
        case this.props.lastLocation.get('accuracy') < 15:
          return require('../../img/gps/gps4.png')
        case this.props.lastLocation.get('accuracy') < 20:
          return require('../../img/gps/gps3.png')
        case this.props.lastLocation.get('accuracy') < 25:
          return require('../../img/gps/gps2.png')
        default:
          return require('../../img/gps/gps1.png')
      }
    } else {
      return null
    }
  }

  render() {
    logRender('RideRecorder.RidingMap')
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapView
            style={styles.map}
            ref={ref => this.map = ref}
            initialRegion={this.fitToElements()}
          >
            <MapView.Polyline
              style={styles.map}
              coordinates={this.props.rideCoords.toJS()}
              strokeColor="#dc0202"
              strokeWidth={5}
            >
            </MapView.Polyline>
          </MapView>
        </View>
        <View style={{position: 'absolute', right: 0, top: 0}} >
          <Image source={this.gpsStatusImage()} style={{width: 50, height: 50}}/>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

