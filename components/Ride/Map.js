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

  fitToElements() {
    this.map.fitToCoordinates(
      this.props.rideCoords,
      {
        animated: true,
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        }
      }
    )
  }

  render() {
    const lastIndex = this.props.rideCoords.length - 1
    const firstCoord = this.props.rideCoords[0]
    const lastCoord = this.props.rideCoords[lastIndex]
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => this.map = ref}
          onLayout={this.fitToElements}
        >
          <MapView.Polyline
            style={styles.map}
            coordinates={this.props.rideCoords}
            strokeColor="#dc0202"
            strokeWidth={5}
          />
          <MapView.Marker
            coordinate={{
              latitude: firstCoord.latitude,
              longitude: firstCoord.longitude
            }}
            pinColor={"#0bc464"}
          />
          <MapView.Marker
            coordinate={{
              latitude: lastCoord.latitude,
              longitude: lastCoord.longitude
            }}
            pincolor={"#ea4a3f"}
          />
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

