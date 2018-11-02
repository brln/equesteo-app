import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import {
  StyleSheet,
  View
} from 'react-native';

import { parseRideCoordinate } from '../../helpers'

export default class Map extends PureComponent {
  constructor (props) {
    super(props)
    this.fitToElements = this.fitToElements.bind(this)
  }

  fitToElements() {
    this.map.fitToCoordinates(
      this.mapCoordinates(this.props.rideCoordinates),
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

  mapCoordinates (rideCoordinates) {
    return rideCoordinates.reduce((accum, coord) => {
      const c = parseRideCoordinate(coord)
      accum.push({
        latitude: c.latitude,
        longitude: c.longitude
      })
      return accum
    }, [])
  }

  render() {
    const lastIndex = this.props.rideCoordinates.count() - 1
    const firstCoord = this.props.rideCoordinates.get(0)
    const lastCoord = this.props.rideCoordinates.get(lastIndex)

    const mapCoords = this.mapCoordinates(this.props.rideCoordinates)
    logDebug(mapCoords)
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
            coordinates={mapCoords}
            strokeColor={"#dc0202"}
            fillColor={"#000000"}
            strokeWidth={5}
          />
          <MapView.Marker
            coordinate={{
              latitude: firstCoord.get('latitude'),
              longitude: firstCoord.get('longitude')
            }}
            pinColor={"#0bc464"}
          />
          <MapView.Marker
            coordinate={{
              latitude: lastCoord.get('latitude'),
              longitude: lastCoord.get('longitude')
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

