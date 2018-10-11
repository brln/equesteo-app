import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';

import {
  StyleSheet,
  View
} from 'react-native';

import KalmanFilter from '../../services/Kalman'
import { simplifyLine } from '../../helpers'


export default class Map extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
  }

  fitToElements() {
    this.map.fitToCoordinates(
      this.props.rideCoords,
      {
        animated: false,
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
    console.log('original: ' + this.props.rideCoords.length)
    console.log('filtered: '+ this.props.filtered.length)

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => this.map = ref}
          onLayout={this.fitToElements}
          mapType="standard"
          provider={"google"}
        >
          <MapView.Polyline
            coordinates={this.props.rideCoords}
            strokeColor={"#dc0202"}
            strokeWidth={5}
          />
          <MapView.Polyline
            coordinates={this.props.filtered}
            strokeColor={"#1514dc"}
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

