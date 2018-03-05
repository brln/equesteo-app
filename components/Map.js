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

  render() {
    const coordinates = this.props.ride.ride_coordinates.map((apiCoord) => {
      return {
        latitude: parseFloat(apiCoord.latitude),
        longitude: parseFloat(apiCoord.longitude),
      }
    })
    let centerLat, centerLong
    [centerLat, centerLong] = this.center(coordinates)

    return (
      <View style ={styles.container}>
        <MapView style={styles.map} initialRegion={{
          latitude: centerLat,
          longitude: centerLong,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
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

