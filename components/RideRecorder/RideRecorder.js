import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';

import Map from '../Map'
import RideDetails from './RideDetails'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'

export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      enteringDetails: false,
    }
    this.dontSaveRide = this.dontSaveRide.bind(this)
    this.rideComplete = this.rideComplete.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  rideComplete () {
    this.setState({
      enteringDetails: true
    })
  }

  dontSaveRide () {
    this.setState({enteringDetails: false})
    this.props.discardRide()
  }

  saveRide (rideName) {
    this.props.saveRide({
      name: rideName,
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
          <Map
            mode={"duringRide"}
            ride={this.props.currentRide}
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
