import { List, Map } from 'immutable'
import React, { PureComponent } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import PropTypes from 'prop-types'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { haversine, logInfo, logRender, parseRideCoordinate } from '../../helpers'
import { brand, darkGrey } from '../../colors'
import { rainbow } from '../../services/Rainbow'
import Amplitude, {
  SWITCH_MAP_TYPE
} from "../../services/Amplitude"

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
    this.gpsIndicator = this.gpsIndicator.bind(this)
    this.gpsStatusImage = this.gpsStatusImage.bind(this)
    this.renderMaptypeButtons = this.renderMaptypeButtons.bind(this)
    this.recenterButton = this.recenterButton.bind(this)
    this.showMaptypeButtons = this.showMaptypeButtons.bind(this)
    this.switchMapType = this.switchMapType.bind(this)
  }

  static mapCoordinates (rideCoordinatesRecord) {
    const featureCollection = {
      type: "FeatureCollection",
      features: []
    }

    let totalDistance = 0
    if (rideCoordinatesRecord) {
      const rideCoordinates = rideCoordinatesRecord.get('rideCoordinates')
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
    }
    return featureCollection
  }

  switchMapType (type) {
    return () => {
      Amplitude.logEvent(SWITCH_MAP_TYPE)
      this.setState({
        mapType: type,
        showingMaptypes: false
      })
    }
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
    if (!this.props.gpsSignalLost) {
      switch (true) {
        case this.props.lastLocation.get('accuracy') < 5:
          return require('../../img/gps/gps5.png')
        case this.props.lastLocation.get('accuracy') < 10:
          return require('../../img/gps/gps4.png')
        case this.props.lastLocation.get('accuracy') < 15:
          return require('../../img/gps/gps3.png')
        case this.props.lastLocation.get('accuracy') < 20:
          return require('../../img/gps/gps2.png')
        default:
          return require('../../img/gps/gps1.png')
      }
    } else {
      return require('../../img/gps/gps0.png')
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
          onPress={this.switchMapType('map')}
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
            onPress={this.switchMapType('photo')}
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

  activeAtlasEntry () {
    if (this.props.activeAtlasEntry) {
      const mapCoords = RidingMap.mapCoordinates(this.props.activeAtlasEntry.get('rideCoordinates'))
      return (
        <MapboxGL.ShapeSource id="atlasSource" shape={mapCoords}>
          <MapboxGL.LineLayer id="atlasRoute" sourceID={"atlasSource"} style={layerStyles.atlasLine}/>
        </MapboxGL.ShapeSource>
      )
    } else {
      return null
    }
  }

  gpsIndicator () {
    if (this.props.lastLocation) {
      const buttonWidth = this.state.showingMaptypes ? width / 1.5 : 46
      return (
        <View style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: buttonWidth,
        }}>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'white', borderRadius: 4, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity style={{flex: 1}} onPress={this.showMaptypeButtons}>
              <View style={{padding: 3}}>
                <BuildImage
                  source={this.gpsStatusImage()}
                  style={{width: 40, height: 40, marginRight: 5}}
                  onError={() => { logInfo('there was an error loading RidingMap image') }}
                />
              </View>
            </TouchableOpacity>
            { this.renderMaptypeButtons() }
          </View>
        </View>
      )
    } else {
      return null
    }
  }

  render() {
    logRender('RideRecorder.RidingMap')
    const mapCoords = RidingMap.mapCoordinates(this.props.currentRideCoordinates)
    const mapStyleURL = this.state.mapType === 'map' ? "mapbox://styles/equesteo/cjopu37k3fm442smn4ncz3x9m" : "mapbox://styles/equesteo/cjoug4j877tc82ro2l2p3n1q2"
    return (
      <View style ={styles.container}>
        <View style={{flex: 1}}>
          <MapboxGL.MapView
            compassEnabled={true}
            onRegionWillChange={this.props.mapRegionChanged}
            styleURL={mapStyleURL}
            style={styles.map}
            rotateEnabled={true}
          >
            <MapboxGL.Camera
              centerCoordinate={this.props.centerCoordinate}
              heading={this.props.heading}
              pitch={45}
              zoomLevel={this.props.zoomLevel}
              isUserInteraction={false}
            />
            {this.activeAtlasEntry()}
            <MapboxGL.ShapeSource id="routeSource" shape={mapCoords}>
              <MapboxGL.LineLayer id="route" sourceID={"routeSource"} style={layerStyles.routeLine}/>
            </MapboxGL.ShapeSource>
            {
              this.props.lastLocation
                ? <MapboxGL.ShapeSource
                  id="currentLocationSource"
                  shape={this.currentLocation(this.props.lastLocation)}
                >
                  <MapboxGL.SymbolLayer
                    id="currentLocation"
                    sourceID={"currentLocationSource"}
                    style={layerStyles.icon}
                  />
                </MapboxGL.ShapeSource>
              : null
            }
          </MapboxGL.MapView>
        </View>
        { this.gpsIndicator() }
        { this.recenterButton() }
      </View>
    )
  }
}

RidingMap.propTypes = {
  centerCoordinate: PropTypes.array,
  heading: PropTypes.number.isRequired,
  lastLocation: PropTypes.instanceOf(Map),
  mapRegionChanged: PropTypes.func.isRequired,
  recenter: PropTypes.func.isRequired,
  userControlledMap: PropTypes.bool.isRequired,
  zoomLevel: PropTypes.number.isRequired,
  currentRideCoordinates: PropTypes.instanceOf(Map),
}

const layerStyles = {
  routeLine: {
    lineColor: ["get", "stroke"],
    lineWidth: 3,
    lineCap: 'round',
  },
  atlasLine: {
    lineColor: darkGrey,
    lineWidth: 3,
    lineCap: 'round',
  },
  icon: {
    iconImage: require('../../img/logo.png'),
    iconIgnorePlacement: true,
    iconSize: 1.5,
  }
}

const styles = {
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
}
