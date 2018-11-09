import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import Mapbox from '@mapbox/react-native-mapbox-gl';
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
        latitude: c.get('latitude'),
        longitude: c.get('longitude')
      })
      return accum
    }, [])
  }

  render() {
    const lastIndex = this.props.rideCoordinates.count() - 1
    const firstCoord = parseRideCoordinate(this.props.rideCoordinates.get(0))
    const lastCoord = parseRideCoordinate(this.props.rideCoordinates.get(lastIndex))

    const mapCoords = this.mapCoordinates(this.props.rideCoordinates)
    return (
      <View style={styles.container}>
        <Mapbox.MapView
          styleURL={"mapbox://styles/equesteo/cjn3zysq408tc2sk1g1gunqmq"}
          zoomLevel={15}
          centerCoordinate={[11.256, 43.770]}
          style={styles.map}>
        </Mapbox.MapView>
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

