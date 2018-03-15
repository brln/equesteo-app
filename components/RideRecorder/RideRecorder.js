import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { unixTimeNow } from "../../helpers"
import RidingMap from '../RidingMap'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'
import { rideCoordsToMapCoords } from "../../helpers"
import { RIDE_DETAILS } from "../../screens"
import { background, highlight, lowlight } from '../../colors'


export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      showGPS: true
    }
    this.rideComplete = this.rideComplete.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.lastLocation) {
      setTimeout(() => {
        this.setState({showGPS: false})
      }, 2000)
    }
  }

  rideComplete () {
    const elapsedTime = (unixTimeNow() - this.props.currentRide.startTime) / 1000
    this.props.navigator.push({
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
    let gpsBar = null
    if (this.state.showGPS) {
      gpsBar = <GPSStatus style={styles.gpsBar} lastLocation={this.props.lastLocation} />
    }
    let startButton = (
      <View style={styles.startButton}>
        <Text onPress={this.startRide} style={styles.startText}>Start Ride</Text>
      </View>
    )
    if (this.props.currentRide) {
      startButton = null
      rideStats = (
        <View style={{flex: 1}}>
          <View style={{flex: 4}}>
            <RidingMap
              mode={"duringRide"}
              rideCoords={rideCoordsToMapCoords(this.props.currentRide.rideCoordinates)}
            />
          </View>
          <View style={styles.bottomSection}>
            <RideStats
              startTime={this.props.currentRide.startTime}
              distance={this.props.currentRide.distance}
            />
            <View style={styles.rideComplete}>
              <Text style={styles.rideCompleteText} onPress={this.rideComplete}>
                Ride Complete
              </Text>
            </View>
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
    backgroundColor: background,
    alignItems: 'stretch'
  },
  startButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  startText: {
    fontSize: 30,
    textAlign: 'center',
    borderWidth: 3,
    borderColor: lowlight,
    backgroundColor: highlight,
    padding: 20,
  },
  bottomSection: {
    flex: 1,
  },
  rideComplete: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    backgroundColor: lowlight
  },
  rideCompleteText: {
    textAlign: 'center',
    fontSize: 25,
    color: background

  },
  gpsBar: {
    flex: 1,
  }
});
