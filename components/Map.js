import React, { Component } from 'react';
import MapView from 'react-native-maps';

import {
  StyleSheet,
  View
} from 'react-native';

import { bearing } from '../helpers'


export default class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    this.parseCoords = this.parseCoords.bind(this)
    this.ridingAnimate = this.ridingAnimate.bind(this)
  }

  parseCoords (rideCoords) {
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

  fitToElements(coordinates) {
    return () => {
      this.map.fitToCoordinates(
        coordinates,
        {
          animated: false,
          edgePadding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          }
        }
      )
    }
  }

  ridingAnimate (coordinates) {
    let viewCoords
    const showCoords = 50
    if (coordinates.length <= showCoords) {
      viewCoords = coordinates
    } else {
      viewCoords = coordinates.slice(showCoords * -1)
    }

    let newBearing = 0
    if (coordinates.length > 1) {
      newBearing = bearing(
        coordinates[coordinates.length - 1].latitude,
        coordinates[coordinates.length - 1].longitude,
        coordinates[coordinates.length - 2].latitude,
        coordinates[coordinates.length - 2].longitude
      )
    }
    return () => {
      if (viewCoords) {
        this.fitToElements(viewCoords)()
      }
      this.map.animateToBearing(newBearing, 1)
    }

  }

  render() {
    const coordinates = this.parseCoords(this.props.ride.ride_coordinates)
    let onLayout = this.fitToElements(coordinates)
    if (this.props.mode === 'duringRide') {
      onLayout = this.ridingAnimate(coordinates)
      if (this.map) {
        onLayout()
      }
    }

    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => this.map = ref}
          onLayout={onLayout}
        >
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

