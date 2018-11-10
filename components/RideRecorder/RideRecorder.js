import React, { PureComponent } from 'react';
import {
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
      gpsTaps: 0,
      showCircles: false,
      fabActive: false,
    }
    this.tapGPS = this.tapGPS.bind(this)
    this.hitPause = this.hitPause.bind(this)
    this.toggleFab = this.toggleFab.bind(this)
  }

  tapGPS () {
    if (this.state.gpsTaps === 5) {
      this.setState({
        gpsTaps: 0,
        showCircles: true
      })
    } else {
      this.setState({
        gpsTaps: this.state.gpsTaps + 1,
        showCircles: false
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

  render() {
    let mainView = null
    let gpsBar = null
    let pauseButton = null
    let cameraButton = null
    if (this.props.showGPSBar) {
      gpsBar = (
        <GPSStatus
          style={styles.gpsBar}
          lastLocation={this.props.lastLocation}
          tapGPS={this.tapGPS}
        />
      )
    }
    if (this.state.fabActive) {
      cameraButton = (
        <Button style={{ backgroundColor: orange }}>
          <FabImage source={require('../../img/camera.png')} height={30} width={30} />
        </Button>
      )
    }
    if (this.state.fabActive && !this.props.currentRide.get('lastPauseStart')) {
      pauseButton = (
        <Button style={{ backgroundColor: danger }} onPress={this.hitPause}>
          <FabImage source={require('../../img/pause.png')} height={30} width={30} />
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
      mainView = (
        <View style={{flex: 1}}>
          <View style={{flex: 5}}>
            <RidingMap
              currentRideCoordinates={this.props.currentRideCoordinates.get('rideCoordinates')}
              lastLocation={this.props.lastLocation}
              refiningLocation={this.props.refiningLocation}
              showCircles={this.state.showCircles}
              tapGPS={this.tapGPS}
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
                {/*{ cameraButton }*/}
              </Fab>
            </View>
            {
              this.props.currentRide.get('lastPauseStart')
                ? <PlayButton onPress={this.props.unpauseLocationTracking}/>
                : null
            }
          </View>
          <View style={styles.bottomSection}>
            <RideStats
              appState={this.props.appState}
              currentRide={this.props.currentRide}
              currentRideCoordinates={this.props.currentRideCoordinates}
              currentRideElevations={this.props.currentRideElevations}
              lastLocation={this.props.lastLocation}
              lastElevation={this.props.lastElevation}
            />
          </View>
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
        { gpsBar }
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
