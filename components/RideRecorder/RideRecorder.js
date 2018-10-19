import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';


import { black, brand, green, white } from '../../colors'
import GPSStatus from './GPSStatus'

import DiscardModal from './DiscardModal'
import RidingMap from './RidingMap'
import RideStats from './RideStats'


export default class RideRecorder extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      gpsTaps: 0,
      showCircles: false
    }
    this.tapGPS = this.tapGPS.bind(this)
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

  render() {
    let rideStats = null
    let gpsBar = null
    if (this.props.showGPSBar) {
      gpsBar = (
        <GPSStatus
          style={styles.gpsBar}
          lastLocation={this.props.lastLocation}
          tapGPS={this.tapGPS}
        />
      )
    }
    let startButton = (
      <View style={styles.startButton}>
        <Text onPress={this.props.startRide} style={styles.startText}>Start Ride</Text>
      </View>
    )
    if (this.props.currentRide) {
      startButton = null
      rideStats = (
        <View style={{flex: 1}}>
          <View style={{flex: 5}}>
            <RidingMap
              refiningLocation={this.props.refiningLocation}
              rideCoords={this.props.currentRide.get('rideCoordinates')}
              showCircles={this.state.showCircles}
              tapGPS={this.tapGPS}
              lastLocation={this.props.lastLocation}
            />
          </View>
          <View style={styles.bottomSection}>
            <RideStats
              appState={this.props.appState}
              currentRideElevations={this.props.currentRideElevations}
              distance={this.props.currentRide.get('distance')}
              lastElevation={this.props.lastElevation}
              moving={this.props.moving}
              rideCoords={this.props.currentRide.get('rideCoordinates')}
              startTime={this.props.currentRide.get('startTime')}
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
        {gpsBar}
        {rideStats}
        {startButton}
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
