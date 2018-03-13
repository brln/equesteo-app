import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';

import { unixTimeNow } from "../../helpers"
import RidingMap from '../RidingMap'
import RideDetails from './RideDetails'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'
import { rideCoordsToMapCoords } from "../../helpers"

export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      enteringDetails: false,
      elapsedTime: 0,
    }
    this.dontSaveRide = this.dontSaveRide.bind(this)
    this.rideComplete = this.rideComplete.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  rideComplete () {
    this.setState({
      enteringDetails: true,
      elapsedTime: (unixTimeNow() - this.props.currentRide.startTime) / 1000
    })
  }

  dontSaveRide () {
    this.setState({
      enteringDetails: false,
      elapsedTime: 0
    })
    this.props.discardRide()
  }

  saveRide (rideDetails) {
    this.props.saveRide({
      horseID: rideDetails.horseID,
      name: rideDetails.name,
      distance: this.props.currentRide.totalDistance,
      elapsed_time_secs: this.state.elapsedTime,
    })
    this.setState({
      enteringDetails: false
    })
  }

  startRide () {
    this.props.startRide()
  }

  render() {
    let rideStats = null
    let detailPage = null
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
            totalDistance={this.props.currentRide.totalDistance}
          />
          <View style={styles.rideComplete}>
            <Button onPress={this.rideComplete} title="Ride Complete"/>
          </View>
        </View>
      )
    }
    if (this.state.enteringDetails) {
      rideStats = null
      startButton = null
      gpsBar = null
      detailPage = (
        <RideDetails
          dontSaveRide={this.dontSaveRide}
          horses={this.props.horses}
          saveRide={this.saveRide}
        />
      )
    }
    return (
      <View style={styles.container}>
        {gpsBar}
        <View style={styles.content}>
          {startButton}
          {rideStats}
          {detailPage}
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
    justifyContent: 'space-around',
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
