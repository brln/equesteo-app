import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';


import { black, brand, green, white } from '../../colors'
import GPSStatus from './GPSStatus'

import RidingMap from './RidingMap'
import RideStats from './RideStats'


export default class RideRecorder extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    let rideStats = null
    let gpsBar = null
    if (this.props.showGPSBar) {
      gpsBar = <GPSStatus style={styles.gpsBar} lastLocation={this.props.lastLocation} />
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
          <View style={{flex: 3}}>
            <RidingMap
              mode={"duringRide"}
              rideCoords={this.props.currentRide.get('rideCoordinates')}
              lastLocation={this.props.lastLocation}
            />
          </View>
          <View style={styles.bottomSection}>
            <RideStats
              appState={this.props.appState}
              startTime={this.props.currentRide.get('startTime')}
              distance={this.props.currentRide.get('distance')}
              rideCoords={this.props.currentRide.get('rideCoordinates')}
            />
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
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
    flex: 1,
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
