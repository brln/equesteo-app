import React, { Component } from 'react';
import MapView from 'react-native-maps';

import {
  StyleSheet,
  View
} from 'react-native';


export default class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  center (coordinates) {
    let x = 0
    let y = 0
    let z = 0

    for (let ride_coord of coordinates) {
      const lat = parseFloat(ride_coord.latitude) * Math.PI / 180;
      const lon = parseFloat(ride_coord.longitude) * Math.PI / 180;
      x += Math.cos(lat) * Math.cos(lon)
      y += Math.cos(lat) * Math.sin(lon)
      z += Math.sin(lat)

      num_coords = this.props.ride.ride_coordinates.length
      x = x / num_coords
      y = y / num_coords
      z = z / num_coords
    }

    let latInRads = Math.atan2(z, Math.sqrt(x * x + y * y))
    let longInRads = Math.atan2(y, x)

    return [latInRads * 180 / Math.PI, longInRads * 180 / Math.PI]
  }

  delta (coordinates) {
    let lats = []
    let longs = []
    for (let rideCoord of coordinates) {
      lats.push(rideCoord.latitude)
      longs.push(rideCoord.longitude)
    }
    let latDelta = 0.01
    let longDelta = 0.01
    if (lats.length > 1 && longs.length > 1) {
      latDelta = Math.abs(Math.max(...lats) - Math.min(...lats)) * 1.8
      longDelta = Math.abs(Math.max(...longs) - Math.min(...longs)) * 1.8
    }
    return [latDelta, longDelta]
  }

  render() {
    const sorted = [...this.props.ride.ride_coordinates].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })

    debugger
    const coordinates = sorted.map((apiCoord) => {
      return {
        latitude: parseFloat(apiCoord.latitude),
        longitude: parseFloat(apiCoord.longitude),
      }
    })
    let centerLat, centerLong
    [centerLat, centerLong] = this.center(coordinates)

    let latDelta, longDelta
    [latDelta, longDelta] = this.delta(coordinates)

    return (
      <View style ={styles.container}>
        <MapView style={styles.map} initialRegion={{
          latitude: centerLat,
          longitude: centerLong,
          latitudeDelta: latDelta,
          longitudeDelta: longDelta
        }}>
          <MapView.Polyline
            style={styles.map}
            coordinates={coordinates}
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
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

