import React, { PureComponent } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, Fab } from 'native-base'

import { black, brand, green, white, orange, danger } from '../../colors'
import FabImage from '../FabImage'
import GPSStatus from './GPSStatus'
import DiscardModal from './DiscardModal'
import RidingMap from './RidingMap'
import RideStats from './RideStats'
import PlayButton from './PlayButton'


export default class RideRecorder extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      fabActive: false,
      userControlledMap: false,
    }
    this.hitPause = this.hitPause.bind(this)
    this.mapAutoControl = this.mapAutoControl.bind(this)
    this.mapUnderUserControl = this.mapUnderUserControl.bind(this)
    this.showCamera = this.showCamera.bind(this)
    this.toggleFab = this.toggleFab.bind(this)
  }

  mapUnderUserControl () {
    this.setState({
      userControlledMap: true
    })
  }

  mapAutoControl () {
    this.setState({
      userControlledMap: false
    })
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

    let show = true
    const needed = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]
    logDebug('asking')
    PermissionsAndroid.requestMultiple(
      needed,
    ).then((granted) => {
      for (let permission of Object.keys(granted)) {
        if (granted[permission] !== PermissionsAndroid.RESULTS.GRANTED) {
          show = false
        }
      }
      if (show) {
        this.props.showCamera()
      } else {
        alert("Sorry, without those permissions you can't take pictures.")
      }
    })
  }

  render() {
    let mainView = null
    let pauseButton = null
    let cameraButton = null
    if (this.state.fabActive && this.props.lastLocation) {
      cameraButton = (
        <Button style={{ backgroundColor: orange }} onPress={this.showCamera}>
          <FabImage source={require('../../img/camera.png')} height={30} width={30} />
        </Button>
      )
    }
    let startButton = (
      <View style={styles.startButton}>
        <Text onPress={this.props.startRide} style={styles.startText}>Start Ride</Text>
      </View>
    )
    if (this.props.currentRide) {
      startButton = null
      if (this.state.fabActive && !this.props.currentRide.get('lastPauseStart')) {
        pauseButton = (
          <Button style={{ backgroundColor: danger }} onPress={this.hitPause}>
            <FabImage source={require('../../img/pause.png')} height={30} width={30} />
          </Button>
        )
      }

      mainView = (
        <View style={{flex: 1}}>
          <View style={{flex: 5}}>
            <RidingMap
              currentRideCoordinates={this.props.currentRideCoordinates.get('rideCoordinates')}
              lastLocation={this.props.lastLocation}
              mapAutoControl={this.mapAutoControl}
              mapUnderUserControl={this.mapUnderUserControl}
              refiningLocation={this.props.refiningLocation}
              showCircles={this.state.showCircles}
            />
            <View>
              <Fab
                active={this.state.fabActive}
                direction="up"
                style={{ backgroundColor: brand }}
                position="bottomRight"
                onPress={this.toggleFab}
              >
                <Text>...</Text>
                { pauseButton }
                { cameraButton }
              </Fab>
            </View>
            <PlayButton
              visible={Boolean(this.props.currentRide.get('lastPauseStart'))}
              onPress={this.props.unpauseLocationTracking}
            />
          </View>
          <RideStats
            appState={this.props.appState}
            currentRide={this.props.currentRide}
            currentRideCoordinates={this.props.currentRideCoordinates}
            currentRideElevations={this.props.currentRideElevations}
            lastLocation={this.props.lastLocation}
            lastElevation={this.props.lastElevation}
            visible={!this.state.userControlledMap}
          />
        </View>
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
        <GPSStatus
          shown={this.props.showGPSBar}
          style={styles.gpsBar}
          lastLocation={this.props.lastLocation}
        />
        { mainView }
        { startButton }
      </View>
    );
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
    borderRadius: 30,
    color: white,
    fontSize: 30,
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
});
