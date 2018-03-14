import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';
import { Navigation } from 'react-native-navigation'

import { unixTimeNow } from "../../helpers"
import RidingMap from '../RidingMap'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'
import { rideCoordsToMapCoords } from "../../helpers"
import { RIDE_DETAILS } from "../../screens"

export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.rideComplete = this.rideComplete.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  rideComplete () {
    const elapsedTime = (unixTimeNow() - this.props.currentRide.startTime) / 1000
    Navigation.showModal({
      screen: RIDE_DETAILS,
      title: 'Ride Details',
      passProps: {
        horses: this.props.horses,
        elapsedTime,
      },
      navigatorStyle: {},
      navigatorButtons: {},
      animationType: 'slide-up',
    });
  }

  startRide () {
    this.props.startRide()
  }

  render() {
    let rideStats = null
    let gpsBar = <GPSStatus lastLocation={this.props.lastLocation} />
    let startButton = (
      <View style={styles.startButton}>
        <Button onPress={this.startRide} title="Start Ride"/>
      </View>
    )
    if (this.props.currentRide) {
      startButton = null
      rideStats = (
        <View>
          <RidingMap
            mode={"duringRide"}
            rideCoords={rideCoordsToMapCoords(this.props.currentRide.ride_coordinates)}
          />
          <RideStats
            startTime={this.props.currentRide.startTime}
            distance={this.props.currentRide.distance}
          />
          <View style={styles.rideComplete}>
            <Button onPress={this.rideComplete} title="Ride Complete"/>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        {gpsBar}
        <View style={styles.content}>
          {startButton}
          {rideStats}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  startButton: {
    maxWidth: 100,
    alignSelf: 'center',
    marginTop: 50,
  },
  rideComplete: {
    alignSelf: 'center',
  }
});
