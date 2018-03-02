import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';


import RideDetails from './RideDetails'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'

const initialState = {
  enteringDetails: false,
  hasPosition: false,
  lastLat: null,
  lastLong: null,
  lastAltitude: null,
  positions: [],
  recording: false,
  startingTime: null,
}

export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = Object.assign({}, initialState)
    this.watchID = null;
    this.newPositionState = this.newPositionState.bind(this)
    this.rideComplete = this.rideComplete.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  newPositionState(position) {
    const thisPosition = {
      lt: position.coords.latitude,
      lg: position.coords.longitude,
      ts: position.timestamp,
    }
    return {
      hasPosition: true ,
      positions: [...this.state.positions, thisPosition],
      lastLat: position.coords.latitude,
      lastLong: position.coords.longitude,
      lastAltitude: position.coords.altitude,
    }
  }

  componentDidMount () {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState(this.newPositionState(position));
      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 1000 }
    );
  }

  componentWillUnmount () {
     navigator.geolocation.clearWatch(this.watchID);
  }

  rideComplete () {
    this.setState({
      recording: false,
      enteringDetails: true
    })
  }

  saveRide (rideName) {
    this.props.saveRide({
      positions: this.state.positions,
      name: rideName,
      startTime: this.state.startingTime,
    })
    this.setState(Object.assign({}, initialState))
  }

  startRide () {
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState(this.newPositionState(position))
      },
      null,
      {enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 10000, distanceFilter: 20}
    )
    this.setState({
      recording: true,
      startingTime: Math.floor(new Date().getTime()),
    })
  }

  render() {
    let rideStats = null
    let detailPage = null
    let gpsBar = <GPSStatus hasPosition={this.state.hasPosition} />
    let startButton = (
      <View style={styles.startButton}>
        <Button style={styles.startButton} onPress={this.startRide} title="Start Ride"/>
      </View>
    )
    if (this.state.recording) {
      startButton = null
      rideStats = (
        <View>
          <RideStats
            lastLat={this.state.lastLat}
            lastLong={this.state.lastLong}
            lastAltitude={this.state.lastAltitude}
            startingTime={this.state.startingTime}
          />
          <Button onPress={this.rideComplete} title="Ride Complete"/>
        </View>
      )
    } else if (this.state.enteringDetails) {
      startButton = null
      gpsBar = null
      detailPage = (
        <RideDetails
          saveRide={this.saveRide}
        />
      )
    }
    return (
      <View style={styles.container}>
        {startButton}
        {rideStats}
        {detailPage}
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
  startButton: {
    maxWidth: 100,
    alignSelf: 'center',
    marginTop: 50,
  }
});
