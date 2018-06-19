import React, { Component } from 'react';
import MapView from 'react-native-maps';

import {
  StyleSheet,
  View
} from 'react-native';

import { bearing, rideCoordsToMapCoords } from '../helpers'

export default class RidingMap extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    // this.changeBearing = this.changeBearing.bind(this)
    this.fitToElements = this.fitToElements.bind(this)
  }

  shouldComponentUpdate(nextProps) {
    let should = false
    if (nextProps.rideCoords.length !== this.props.rideCoords.length) {
      should = true
    }
    return should
  }

  fitToElements() {
    const lats = this.props.rideCoords.map(c => c.latitude)
    const longs = this.props.rideCoords.map(c => c.longitude)
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
    let coordinates = this.props.rideCoords
    if (coordinates.length > 1) {
      newBearing = bearing(
        coordinates[coordinates.length - 2].latitude,
        coordinates[coordinates.length - 2].longitude,
        coordinates[coordinates.length - 1].latitude,
        coordinates[coordinates.length - 1].longitude
      )
      this.map.animateToBearing(newBearing, 500)
    }
  }

  render() {
    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => this.map = ref}
          region={this.fitToElements()}
          // onRegionChangeComplete={this.changeBearing}
        >
          <MapView.Polyline
            style={styles.map}
            coordinates={this.props.rideCoords}
            strokeColor="#dc0202"
            strokeWidth={5}
          >
          </MapView.Polyline>
        </MapView>
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

