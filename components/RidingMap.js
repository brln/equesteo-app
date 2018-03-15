import React, { Component } from 'react';
import MapView from 'react-native-maps';

import {
  StyleSheet,
  View
} from 'react-native';

import { bearing } from '../helpers'


export default class RidingMap extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    // this.changeBearing = this.changeBearing.bind(this)
    this.fitToElements = this.fitToElements.bind(this)
  }

  fitToElements() {
    const maxLat = Math.max(...this.props.rideCoords.map((c) => c.latitude))
    const minLat = Math.min(...this.props.rideCoords.map((c) => c.latitude))
    const maxLong = Math.max(...this.props.rideCoords.map((c) => c.longitude))
    const minLong = Math.min(...this.props.rideCoords.map((c) => c.longitude))
    debugger
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

