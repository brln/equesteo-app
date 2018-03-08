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
    this.fitToElements = this.fitToElements.bind(this)
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
            left: 10
          }
        }
      )
    }
  }

  render() {
    const sorted = [...this.props.ride.ride_coordinates].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })

    const coordinates = sorted.map((apiCoord) => {
      return {
        latitude: parseFloat(apiCoord.latitude),
        longitude: parseFloat(apiCoord.longitude),
      }
    })

    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => this.map = ref}
          onLayout={this.fitToElements(coordinates)}
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

