import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { bearing, logError, logRender, parseRideCoordinate } from '../../helpers'

export default class RidingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.fitToElements = this.fitToElements.bind(this)
    this.changeBearing = this.changeBearing.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.currentRideCoordinates.count() === 0 && this.props.currentRideCoordinates.count() === 1) {
  //     this.map.animateToRegion(this.fitToElements())
  //   }
  //   this.changeBearing()
  // }

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
    let secondToLast = parseRideCoordinate(
      this.props.currentRideCoordinates.get(this.props.currentRideCoordinates.count() - 2)
    )
    if (this.props.currentRideCoordinates.count() > 1 && this.props.lastLocation.get('speed') > 0) {
      newBearing = bearing(
        secondToLast.get('latitude'),
        secondToLast.get('longitude'),
        this.props.lastLocation.get('latitude'),
        this.props.lastLocation.get('longitude')
      )
      this.map.animateToNavigation(this.props.lastLocation.toJS(), newBearing, 45)
    }
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
    logRender('RideRecorder.RidingMap')
    const mapCoords = this.mapCoordinates(this.props.currentRideCoordinates)
    let lastLocAccuracy
    let refiningLocationLimit
    if (this.props.showCircles && this.props.refiningLocation) {
      refiningLocationLimit = (
         <MapView.Circle
          center={this.props.refiningLocation.toJS()}
          radius={(25 * 0.3048)}
          strokeColor={'blue'}
          strokeWidth={2}
        />
      )
      if (this.props.lastLocation) {
        lastLocAccuracy = (
          <MapView.Circle
            center={this.props.lastLocation.toJS()}
            radius={(this.props.lastLocation.get('accuracy'))}
            strokeColor={'purple'}
            strokeWidth={2}
          />
        )
      }
    }
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapView
            style={styles.map}
            ref={ref => this.map = ref}
            initialRegion={this.fitToElements()}
            provider={"google"}
          >
            <MapView.Polyline
              coordinates={mapCoords}
              strokeColor="#dc0202"
              strokeWidth={5}
            />
            { refiningLocationLimit }
            { lastLocAccuracy }
          </MapView>
        </View>
        <View style={{position: 'absolute', right: 0, top: 0}} >
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

