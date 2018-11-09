import React, { PureComponent } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import {
  StyleSheet,
  View
} from 'react-native';

import { boundingBox, haversine, parseRideCoordinate, speedGradient } from '../../helpers'

export default class ViewingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.fitToElements = this.fitToElements.bind(this)
  }

  mapCoordinates (rideCoordinates) {
    const featureCollection = {
      type: "FeatureCollection",
      features: []
    }

    const coordinates = rideCoordinates.reduce((accum, coord) => {
      const c = parseRideCoordinate(coord)
      if (!accum.lastCoord) {
        accum.lastCoord = c
      } else {
        const timeDiff = ((c.get('timestamp') - accum.lastCoord.get('timestamp')) / 1000) / 60 / 60
        let distance = haversine(
          accum.lastCoord.get('latitude'),
          accum.lastCoord.get('longitude'),
          c.get('latitude'),
          c.get('longitude')
        )
        let speed = distance / timeDiff

        const feature = {
          type: 'Feature',
          properties: {
            stroke: speedGradient(speed),
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [accum.lastCoord.get('longitude'), accum.lastCoord.get('latitude')],
              [c.get('longitude'), c.get('latitude')]
            ]
          }
        }
        accum.featureCollection.features.push(feature)
        accum.lastCoord = c
      }
      return accum
    }, {lastCoord: null, featureCollection})
    return featureCollection
  }

  fitToElements () {
    const bounds = boundingBox(this.props.rideCoordinates)
    logDebug(bounds)
    this.map.fitBounds(bounds[0], bounds[1], 20, 200)
  }

  render() {
    const lastIndex = this.props.rideCoordinates.count() - 1
    const firstCoord = parseRideCoordinate(this.props.rideCoordinates.get(0))
    const lastCoord = parseRideCoordinate(this.props.rideCoordinates.get(lastIndex))

    const mapCoords = this.mapCoordinates(this.props.rideCoordinates)
    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          styleURL={"mapbox://styles/equesteo/cjn3zysq408tc2sk1g1gunqmq"}
          onDidFinishLoadingMap={this.fitToElements}
          style={styles.map}>
            <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
              <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
            </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </View>
    )
  }
}

const layerStyles = MapboxGL.StyleSheet.create({
  routeLine: {
    lineColor: MapboxGL.StyleSheet.identity('stroke'),
    lineWidth: 3,
    lineCap: 'round'
  },
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

