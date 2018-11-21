import React, { PureComponent } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { heading, logError, logRender, parseRideCoordinate } from '../../helpers'
import { brand, routeLine } from '../../colors'

const { width } = Dimensions.get('window')

export default class RidingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      heading: 0,
      centerCoordinate: null,
      userRecentered: false,
      zoomLevel: 14
    }
    this.fitToElements = this.fitToElements.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
    this.mapRegionChanged = this.mapRegionChanged.bind(this)
    this.recenter = this.recenter.bind(this)
    this.recenterButton = this.recenterButton.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    const newState = {...state}
    if (!state.userRecentered) {
      newState.centerCoordinate = RidingMap.centerCoordinate(props.lastLocation)
      newState.heading = RidingMap.changeHeading(props.currentRideCoordinates, props.lastLocation)
    }
    return newState
  }

  static centerCoordinate (lastLocation) {
     return  lastLocation
       ? [lastLocation.get('longitude'), lastLocation.get('latitude')]
       : null
  }

  recenter () {
    this.setState({
      centerCoordinate: RidingMap.centerCoordinate(this.props.lastLocation),
      heading: RidingMap.changeHeading(this.props.currentRideCoordinates, this.props.lastLocation),
      userRecentered: false,
      zoomLevel: 14,
    })
    this.props.mapAutoControl()
  }

  static changeHeading (currentRideCoordinates, lastLocation) {
    let newHeading = 0
    if (currentRideCoordinates.count() > 1) {
      let secondToLast = parseRideCoordinate(
        currentRideCoordinates.get(currentRideCoordinates.count() - 2)
      )
      if (currentRideCoordinates.count() > 1
        && (lastLocation.get('speed') === undefined || lastLocation.get('speed') > 0)) {
        newHeading = heading(
          secondToLast.get('latitude'),
          secondToLast.get('longitude'),
          lastLocation.get('latitude'),
          lastLocation.get('longitude')
        )
      }
    }
    return newHeading
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

  mapRegionChanged (e) {
    if (e.properties.isUserInteraction) {
      this.setState({
        heading: e.properties.heading,
        userRecentered: true,
        centerCoordinate: e.geometry.coordinates,
        zoomLevel: e.properties.zoomLevel

      })
      this.props.mapUnderUserControl()
    }
  }

  recenterButton () {
    if (this.state.userRecentered) {
      return (
        <View style={{position: 'absolute', left: 20, bottom: 35}}>
          <TouchableOpacity
            style={{backgroundColor: 'white', height: width / 8, width: width / 3, borderRadius: 3}}
            onPress={this.recenter}
          >
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <View style={{flex: 1}}>
                <BuildImage style={{height: width / 9, width: width / 9}} source={require('../../img/recenter.png')} resizeMode={"contain"}/>
              </View>
              <View style={{flex: 3}}>
                <Text style={styles.text}>Re-center</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    } else {
      return null
    }
  }

  render() {
    logRender('RideRecorder.RidingMap')
    const mapCoords = this.mapCoordinates(this.props.currentRideCoordinates)
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapboxGL.MapView
            animated={true}
            centerCoordinate={this.state.centerCoordinate}
            compassEnabled={true}
            onRegionDidChange={this.mapRegionChanged}
            pitch={45}
            heading={this.state.heading}
            ref={ref => (this.map = ref)}
            styleURL={"mapbox://styles/equesteo/cjopu37k3fm442smn4ncz3x9m"}
            onDidFinishLoadingMap={this.fitToElements}
            style={styles.map}
            zoomLevel={this.state.zoomLevel}
          >
            <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
              <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
        <View style={{position: 'absolute', left: 0, top: 0}} >
          <BuildImage
            source={this.gpsStatusImage()}
            style={{width: 50, height: 50}}
            onError={(e) => { logError('there was an error loading RidingMap image') }}
          />
        </View>
        { this.recenterButton() }
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
  text: {
    color: brand,
    textAlign:'left',
    paddingLeft : 10,
    paddingRight : 10,
    fontSize: 15
  },
});
