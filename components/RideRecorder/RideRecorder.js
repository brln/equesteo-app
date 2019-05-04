import React, { PureComponent } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  View
} from 'react-native';

import { black, brand, green, white, orange, danger, warning } from '../../colors'
import { heading, isAndroid, parseRideCoordinate } from '../../helpers'
import GPSStatus from './GPSStatus'
import DiscardModal from './DiscardModal'
import HoofTracksModal from './HoofTracksModal'
import MapButton from './MapButton'
import RidingMap from './RidingMap'
import RideStats from './RideStats'
import PlayButton from './PlayButton'


export default class RideRecorder extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      centerCoordinate: null,
      fabActive: false,
      userControlledMap: false,
      heading: 0,
      mapRef: null,
      nullMapLocation: props.nullMapLocation ? props.nullMapLocation.toJS() : null,
      zoomLevel: 14,
    }
    this.clearActiveAtlasEntry = this.clearActiveAtlasEntry.bind(this)
    this.hitPause = this.hitPause.bind(this)
    this.mapRegionChanged = this.mapRegionChanged.bind(this)
    this.recenter = this.recenter.bind(this)
    this.showAtlas = this.showAtlas.bind(this)
    this.setMapRef = this.setMapRef.bind(this)
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
    } else if (this.state.mapRef) {
      this.state.mapRef.setCamera({
        heading: this.state.heading,
        duration: 50
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
          alert("Sorry, without those permissions you can't take pictures.")
        }
      })
    } else {
      this.props.showCamera()
    }
  }

  setMapRef (ref) {
    this.setState({
      mapRef: ref
    })
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
      hoofTracksButton = (
        <MapButton
          color={green}
          icon={require('../../img/radio.png')}
          onPress={this.props.openHoofTracksModal}
        />
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
        <DiscardModal
          modalOpen={this.props.discardModalOpen}
          closeDiscardModal={this.props.closeDiscardModal}
          discardFunc={this.props.discardRide}
          text={"You haven't gone anywhere on this ride yet. Do you want to close it?"}
        />
        <HoofTracksModal
          closeModal={this.props.closeHoofTracksModal}
          modalOpen={this.props.hoofTracksModalOpen}
          onPress={() => {}}
        />
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
              lastLocation={this.props.lastLocation}
              mapRegionChanged={this.mapRegionChanged}
              recenter={this.recenter}
              refiningLocation={this.props.refiningLocation}
              setMapRef={this.setMapRef}
              userControlledMap={this.state.userControlledMap}
              zoomLevel={this.state.zoomLevel}
            />
            <View style={{position: 'absolute', bottom: 10, right: 10}}>
              <View style={{flex: 1}}>
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
