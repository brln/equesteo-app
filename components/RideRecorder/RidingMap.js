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
import { haversine, logError, logRender, parseRideCoordinate } from '../../helpers'
import { brand, darkGrey, lightGrey } from '../../colors'
import { rainbow } from '../../services/Rainbow'

const { width } = Dimensions.get('window')

const allColors = rainbow()

export default class RidingMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showingMaptypes: false,
      mapType: 'map'
    }
    this.fitToElements = this.fitToElements.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
    this.mapTypeMap = this.mapTypeMap.bind(this)
    this.mapTypePhoto = this.mapTypePhoto.bind(this)
    this.renderMaptypeButtons = this.renderMaptypeButtons.bind(this)
    this.recenterButton = this.recenterButton.bind(this)
    this.showMaptypeButtons = this.showMaptypeButtons.bind(this)
  }

  static mapCoordinates (rideCoordinates) {
    const featureCollection = {
      type: "FeatureCollection",
      features: []
    }

    let totalDistance = 0
    rideCoordinates.reduce((accum, coord) => {
      const c = parseRideCoordinate(coord)
      if (!accum.lastCoord) {
        accum.lastCoord = c
      } else {
        totalDistance += haversine(
          accum.lastCoord.get('latitude'),
          accum.lastCoord.get('longitude'),
          c.get('latitude'),
          c.get('longitude')
        )
        const mile = Math.floor(totalDistance) % 100
        const feature = {
          type: 'Feature',
          properties: {
            stroke: `#${allColors[mile]}`,
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

  mapTypeMap () {
    this.setState({
      mapType: 'map',
      showingMaptypes: false
    })
  }

  mapTypePhoto () {
    this.setState({
      mapType: 'photo',
      showingMaptypes: false
    })
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

  currentLocation (lastLocation) {
    let coords = []
    if (lastLocation) {
      coords = [lastLocation.get('longitude'), lastLocation.get('latitude')]
    }
    return {
      type: "FeatureCollection",
      features: [{
        type: 'Feature',
        "geometry": {
          "type": "Point",
          "coordinates": coords
        },
        id: 'currentLocation'
      }]
    }
  }

  recenterButton () {
    if (this.props.userControlledMap) {
      return (
        <View style={{position: 'absolute', left: 20, bottom: 35}}>
          <TouchableOpacity
            style={{backgroundColor: 'white', height: width / 8, width: width / 3, borderRadius: 3}}
            onPress={this.props.recenter}
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

  renderMaptypeButtons () {
    if (this.state.showingMaptypes) {
      const chosenColor = '#aaa3a2'
      const notChosenColor = '#ffffff'
      return [
          <TouchableOpacity key="map" style={{
            flex: 2,
            borderRightWidth: 1,
            borderRightColor: darkGrey,
            borderLeftWidth: 2,
            borderLeftColor: darkGrey,
            height: '100%',
            justifyContent: 'center',
            backgroundColor: this.state.mapType === 'map' ? chosenColor : notChosenColor
          }}
          onPress={this.mapTypeMap}
          >
            <Text style={{textAlign: 'center'}}>Map</Text>
          </TouchableOpacity>,
          <TouchableOpacity key="photo" style={{
            flex: 2,
            borderLeftWidth: 1,
            borderLeftColor: darkGrey,
            height: '100%',
            justifyContent: 'center',
            borderTopRightRadius: 4,
            backgroundColor: this.state.mapType === 'photo' ? chosenColor : notChosenColor,
            borderBottomRightRadius: 4}}
            onPress={this.mapTypePhoto}
          >
            <Text style={{textAlign: 'center'}}>Photo</Text>
          </TouchableOpacity>
        ]
    } else {
      return null
    }
  }

  showMaptypeButtons () {
    this.setState({
      showingMaptypes: !this.state.showingMaptypes
    })
  }

  render() {
    logRender('RideRecorder.RidingMap')
    const buttonWidth = this.state.showingMaptypes ? width / 2 : 40
    const mapCoords = RidingMap.mapCoordinates(this.props.currentRideCoordinates)
    const mapStyleURL = this.state.mapType === 'map' ? "mapbox://styles/equesteo/cjopu37k3fm442smn4ncz3x9m" : "mapbox://styles/equesteo/cjoug4j877tc82ro2l2p3n1q2"
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapboxGL.MapView
            animated={true}
            centerCoordinate={this.props.centerCoordinate}
            compassEnabled={true}
            onRegionDidChange={this.props.mapRegionChanged}
            pitch={45}
            heading={this.props.heading}
            ref={ref => (this.map = ref)}
            styleURL={mapStyleURL}
            onDidFinishLoadingMap={this.fitToElements}
            style={styles.map}
            zoomLevel={this.props.zoomLevel}
          >
            <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
              <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
            </MapboxGL.ShapeSource>
            <MapboxGL.ShapeSource
              id="currentLocationSource"
              shape={this.currentLocation(this.props.lastLocation)}
            >
              <MapboxGL.SymbolLayer
                id="currentLocation"
                sourceID={"currentLocationSource"}
                style={layerStyles.icon}
              />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
        <View style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: buttonWidth,
        }}>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'white', borderRadius: 4, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity style={{flex: 1}} onPress={this.showMaptypeButtons}>
              <BuildImage
                source={this.gpsStatusImage()}
                style={{width: 40, height: 40, marginRight: 5}}
                onError={(e) => { logError('there was an error loading RidingMap image') }}
              />
            </TouchableOpacity>
            { this.renderMaptypeButtons() }
          </View>
        </View>
        { this.recenterButton() }
      </View>
    )
  }
}

const layerStyles = MapboxGL.StyleSheet.create({
  routeLine: {
    lineColor: MapboxGL.StyleSheet.identity('stroke'),
    lineWidth: 3,
    lineCap: 'round',
  },
  icon: {
    iconImage: require('../../img/logo.png'),
    iconIgnorePlacement: true,
    iconSize: 1.5,
  }
})

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
