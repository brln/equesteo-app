import React, { PureComponent } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import memoizeOne from 'memoize-one';

import {
  StyleSheet,
  View
} from 'react-native';

import { boundingBox, haversine, logError, parseRideCoordinate, speedGradient } from '../../helpers'

export default class ViewingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.fitToElements = this.fitToElements.bind(this)
    this.photoPress = this.photoPress.bind(this)

    this.memoMapCoordinates = memoizeOne(this.mapCoordinates)
    this.memoBoundingBox = memoizeOne(boundingBox)
  }

  mapCoordinates (rideCoordinates) {
    const featureCollection = {
      type: "FeatureCollection",
      features: []
    }

    rideCoordinates.reduce((accum, coord) => {
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

  photoCoords (ridePhotos) {
    const featureCollection = {
      type: "FeatureCollection",
      features: []
    }

    ridePhotos.reduce((accum, photo) => {
      if (photo.get('lat') && photo.get('lng')) {
        const feature = {
          type: 'Feature',
          "geometry": {
            "type": "Point",
            "coordinates": [photo.get('lng'), photo.get('lat')]
          },
          id: photo.get('_id')
        }
        accum.push(feature)
      }
      return accum
    }, featureCollection.features)
    return featureCollection
  }

  fitToElements () {
    const bounds = this.memoBoundingBox(this.props.rideCoordinates)
    this.map.fitBounds(bounds[0], bounds[1], 20, 200)
  }

  photoPress (e) {
    const top = e.properties.screenPointY + 22
    const right = e.properties.screenPointX + 22
    const bottom = e.properties.screenPointY - 22
    const left = e.properties.screenPointX - 22
    const bbox = [top, right, bottom, left]
    this.map.queryRenderedFeaturesInRect(bbox, [], ['photos']).then((features) => {
      if (features.features.length > 0) {
        const sources = features.features.map((feature) => {
          return {url: this.props.ridePhotos.getIn([feature.id, 'uri'])}
        })
        this.props.showPhotoLightbox(sources)
      }
    }).catch(e => {
      logError(e, 'ViewingMap.photoPress')
    })

  }

  render() {
    const mapCoords = this.memoMapCoordinates(this.props.rideCoordinates)
    const photoCoords = this.photoCoords(this.props.ridePhotos)
    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          styleURL={"mapbox://styles/equesteo/cjopu37k3fm442smn4ncz3x9m"}
          onDidFinishLoadingMap={this.fitToElements}
          style={styles.map}
          onPress={this.photoPress}
        >
          <MapboxGL.Camera
            ref={ref => (this.map = ref)}
          />
          <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
            <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
          </MapboxGL.ShapeSource>

          <MapboxGL.ShapeSource
            id="photoSource"
            shape={photoCoords}
          >
            <MapboxGL.SymbolLayer
              id="photos"
              minZoomLevel={3}
              sourceID={"photoSource"}
              style={layerStyles.icon}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </View>
    )
  }
}

const layerStyles = {
  routeLine: {
    lineColor: ['get', 'stroke'],
    lineWidth: 3,
    lineCap: 'round',
  },
  icon: {
    iconImage: require('../../img/photoLocation.png'),
    iconIgnorePlacement: true,
    iconSize: 2
  }
}

const styles = {
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}

