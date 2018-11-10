import React, { PureComponent } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { bearing, logError, logRender, parseRideCoordinate } from '../../helpers'
import { routeLine } from '../../colors'

export default class RidingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    this.changeBearing = this.changeBearing.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
  }

  fitToElements() {
    const { lats, longs } = this.props.currentRideCoordinates.reduce((accum, coord) => {
      const parsedCoord = parseRideCoordinate(coord)
      accum.lats.push(parsedCoord.get('latitude'))
      accum.longs.push(parsedCoord.get('longitude'))
      return accum
    }, {lats: [], longs: []})
    const maxLat = Math.max(...lats)
    const minLat = Math.min(...lats)
    const maxLong = Math.max(...longs)
    const minLong = Math.min(...longs)
    const latitude = ((maxLat - minLat) / 2) + minLat || 0
    const longitude = ((maxLong - minLong) / 2) + minLong || 0
    const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.01)
    const longitudeDelta = Math.max((maxLong - minLong) * 1.2, 0.01)
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    }
  }

  changeBearing () {
    let newBearing = 0
    if (this.props.currentRideCoordinates.count() > 1) {
      let secondToLast = parseRideCoordinate(
        this.props.currentRideCoordinates.get(this.props.currentRideCoordinates.count() - 2)
      )
      if (this.props.currentRideCoordinates.count() > 1
        && (this.props.lastLocation.get('speed') === undefined || this.props.lastLocation.get('speed') > 0)) {
        newBearing = bearing(
          secondToLast.get('latitude'),
          secondToLast.get('longitude'),
          this.props.lastLocation.get('latitude'),
          this.props.lastLocation.get('longitude')
        )
      }
    }
    return newBearing
  }

  gpsStatusImage () {
    if (this.props.lastLocation) {
      switch (true) {
        case this.props.lastLocation.get('accuracy') < 10:
          return require('../../img/gps/gps5.png')
        case this.props.lastLocation.get('accuracy') < 20:
          return require('../../img/gps/gps4.png')
        case this.props.lastLocation.get('accuracy') < 30:
          return require('../../img/gps/gps3.png')
        case this.props.lastLocation.get('accuracy') < 40:
          return require('../../img/gps/gps2.png')
        default:
          return require('../../img/gps/gps1.png')
      }
    } else {
      return null
    }
  }

  mapCoordinates (rideCoordinates) {
    const coordinates = rideCoordinates.reduce((accum, coord) => {
      const c = parseRideCoordinate(coord)
      accum.push([c.get('longitude'), c.get('latitude')])
      return accum
    }, [])
    return {
      type: "FeatureCollection",
      features: [{
        type: 'Feature',
        geometry: {
          type: "LineString",
          coordinates
        }
      }]
    }
  }


  render() {
    const centerCoordinate = this.props.lastLocation ? [this.props.lastLocation.get('longitude'), this.props.lastLocation.get('latitude')] : null
    logRender('RideRecorder.RidingMap')
    const mapCoords = this.mapCoordinates(this.props.currentRideCoordinates)
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapboxGL.MapView
            animated={true}
            centerCoordinate={centerCoordinate}
            compassEnabled={true}
            pitch={45}
            heading={this.changeBearing()}
            ref={ref => (this.map = ref)}
            styleURL={"mapbox://styles/equesteo/cjn3zysq408tc2sk1g1gunqmq"}
            onDidFinishLoadingMap={this.fitToElements}
            style={styles.map}
            zoomLevel={14}
          >
            <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
              <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
        <View style={{position: 'absolute', left: 0, top: 0}} >
          <TouchableOpacity onPress={this.props.tapGPS}>
            <BuildImage
              source={this.gpsStatusImage()}
              style={{width: 50, height: 50}}
              onError={(e) => { logError('there was an error loading RidingMap image') }}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const layerStyles = MapboxGL.StyleSheet.create({
  routeLine: {
    lineColor: routeLine,
    lineWidth: 3,
    lineCap: 'round',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

