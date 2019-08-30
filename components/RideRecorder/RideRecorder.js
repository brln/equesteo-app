import React, { PureComponent } from 'react';
import {
  Alert,
  PermissionsAndroid,
  StyleSheet,
  View
} from 'react-native';

import { black, brand, green, white, orange, danger, warning } from '../../colors'
import { heading, isAndroid, parseRideCoordinate } from '../../helpers'
import GPSStatus from './GPSStatus'
import MapButton from './MapButton'
import RidingMap from './RidingMap'
import RideStats from './RideStats'
import PlayButton from './PlayButton'
import Pulse from '../Shared/Pulse'


export default class RideRecorder extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      centerCoordinate: null,
      fabActive: false,
      userControlledMap: false,
      heading: 0,
      nullMapLocation: props.nullMapLocation ? props.nullMapLocation.toJS() : null,
      zoomLevel: 14,
    }
    this.clearActiveAtlasEntry = this.clearActiveAtlasEntry.bind(this)
    this.hitPause = this.hitPause.bind(this)
    this.mapRegionChanged = this.mapRegionChanged.bind(this)
    this.recenter = this.recenter.bind(this)
    this.showAtlas = this.showAtlas.bind(this)
    this.showCamera = this.showCamera.bind(this)
    this.toggleFab = this.toggleFab.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    const newState = {...state}
    if (!state.userControlledMap && props.currentRideCoordinates && props.lastLocation) {
      newState.centerCoordinate = RideRecorder.centerCoordinate(props.lastLocation)
      newState.heading = RideRecorder.currentHeading(
        props.currentRideCoordinates.get('rideCoordinates'),
        props.lastLocation
      )
    }
    return newState
  }

  static currentHeading (currentRideCoordinates, lastLocation) {
    let newHeading = 0
    if (currentRideCoordinates.count() > 1) {
      let secondToLast = parseRideCoordinate(
        currentRideCoordinates.get(currentRideCoordinates.count() - 2)
      )
      if (lastLocation.get('speed') === undefined || lastLocation.get('speed') > 0) {
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

  static centerCoordinate (lastLocation) {
     return  lastLocation
       ? [lastLocation.get('longitude'), lastLocation.get('latitude')]
       : null
  }

  recenter () {
    if (this.props.currentRideCoordinates) {
      this.setState({
        centerCoordinate: RideRecorder.centerCoordinate(this.props.lastLocation),
        heading: RideRecorder.currentHeading(
          this.props.currentRideCoordinates.get('rideCoordinates'),
          this.props.lastLocation
        ),
        userControlledMap: false,
        zoomLevel: 14,
      })
    }
  }

  mapRegionChanged (e) {
    if (e.properties.isUserInteraction) {
      this.setState({
        heading: e.properties.heading,
        userControlledMap: true,
        centerCoordinate: e.geometry.coordinates,
        zoomLevel: e.properties.zoomLevel
      })
    }
  }

  toggleFab () {
    this.setState({
      fabActive: !this.state.fabActive
    })
  }

  hitPause () {
    this.props.pauseLocationTracking()
    this.toggleFab()
  }

  showCamera () {
    this.toggleFab()
    if (isAndroid()) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then((granted) => {
        const show = Object.values(granted).filter(p => {
          return p !== PermissionsAndroid.RESULTS.GRANTED
        }).length === 0
        if (show) {
          this.props.showCamera()
        } else {
          Alert.alert("Sorry, without those permissions you can't take pictures.")
        }
      })
    } else {
      this.props.showCamera()
    }
  }

  showAtlas () {
    this.toggleFab()
    this.props.showAtlas()
  }

  clearActiveAtlasEntry () {
    this.toggleFab()
    this.props.clearActiveAtlasEntry()
  }

  render() {
    let pauseButton
    let cameraButton
    let atlasButton
    let hoofTracksButton

    if (this.props.activeAtlasEntry) {
      atlasButton = (
        <MapButton
          color={warning}
          icon={require('../../img/noAtlas.png')}
          onPress={this.clearActiveAtlasEntry}
        />
      )
    } else {
      atlasButton = (
        <MapButton
          color={warning}
          icon={require('../../img/atlas.png')}
          onPress={this.showAtlas}
        />
      )
    }
    if (this.props.lastLocation) {
      cameraButton = (
        <MapButton
          color={orange}
          icon={require('../../img/camera.png')}
          onPress={this.showCamera}
        />
      )
      let pulse = null
      if (this.props.hoofTracksRunning) {
        pulse = <Pulse color='orange' numPulses={3} diameter={80} speed={50} duration={25000} />
      }
      hoofTracksButton = (
        <View>
          { pulse }
          <MapButton
            color={green}
            icon={require('../../img/radio.png')}
            onPress={this.props.startHoofTracks}
          />
        </View>
      )
    }
    if (this.props.currentRide && !this.props.currentRide.get('lastPauseStart')) {
      pauseButton = (
        <MapButton
          color={danger}
          icon={require('../../img/pause.png')}
          onPress={this.hitPause}
        />
      )
    }
    return (
      <View style={styles.container}>
        <GPSStatus
          shown={this.props.showGPSBar}
          style={styles.gpsBar}
          lastLocation={this.props.lastLocation}
        />
        <View style={{flex: 1}}>
          <View style={{flex: 5}}>
            <RidingMap
              activeAtlasEntry={this.props.activeAtlasEntry}
              currentRideCoordinates={this.props.currentRideCoordinates}
              heading={this.state.heading}
              centerCoordinate={this.state.centerCoordinate ? this.state.centerCoordinate : this.state.nullMapLocation}
              gpsSignalLost={this.props.gpsSignalLost}
              lastLocation={this.props.lastLocation}
              mapRegionChanged={this.mapRegionChanged}
              recenter={this.recenter}
              refiningLocation={this.props.refiningLocation}
              userControlledMap={this.state.userControlledMap}
              zoomLevel={this.state.zoomLevel}
            />
            <View style={{position: 'absolute', bottom: 10, right: 10}}>
              <View style={{flex: 1}}>
                { hoofTracksButton }
                { atlasButton }
                { pauseButton }
                { cameraButton }
              </View>
            </View>
            <PlayButton
              visible={Boolean(this.props.currentRide && this.props.currentRide.get('lastPauseStart'))}
              onPress={this.props.unpauseLocationTracking}
            />
          </View>
          { this.props.currentRide ? <RideStats
            appState={this.props.appState}
            currentRide={this.props.currentRide}
            currentRideCoordinates={this.props.currentRideCoordinates}
            currentRideElevations={this.props.currentRideElevations}
            lastLocation={this.props.lastLocation}
            lastElevation={this.props.lastElevation}
            visible={!this.state.userControlledMap}
          /> : null }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  startButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  startText: {
    borderRadius: 40,
    color: white,
    fontSize: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: black,
    backgroundColor: green,
    padding: 20,
    overflow: 'hidden'
  },
  bottomSection: {
    flex: 3,
  },
  rideComplete: {
    backgroundColor: brand,
    flex: 1,
    justifyContent: 'center',
  },
  rideCompleteText: {
    textAlign: 'center',
    fontSize: 25,
    color: white,
  },
  gpsBar: {
    flex: 1,
  }
})
