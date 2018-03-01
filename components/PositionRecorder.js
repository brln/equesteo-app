import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';

import TimeElapsed from './TimeElapsed'

const initialState = {
  hasPosition: false,
  lastLat: null,
  lastLong: null,
  lastAltitude: null,
  positions: [],
  recording: false,
  startingTime: null,
}

export default class PositionRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = Object.assign({}, initialState)
    this.watchID = null;
    this.newPositionState = this.newPositionState.bind(this)
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

  saveRide () {
    this.props.saveRide({
      positions: this.state.positions,
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
    let positionFound = <Text style={styles.locationNotFound}>Location Not Found</Text>
    if (this.state.hasPosition) {
      positionFound = <Text style={styles.locationFound}>Location Found!</Text>
    }
    let rideStats = null;
    let startButton = <View><Button onPress={this.startRide} title="Start Ride"/></View>
    if (this.state.recording && this.state.startingTime) {
      startButton = null
      rideStats = (
        <View>
          <Text style={styles.statFont}>Latitude: {this.state.lastLat}</Text>
          <Text style={styles.statFont}>Longitude: {this.state.lastLong}</Text>
          <Text style={styles.statFont}>Altitude: {this.state.lastAltitude}</Text>
          <TimeElapsed
            startingTime={this.state.startingTime}
          />
          <Button onPress={this.saveRide} title="Save Ride"/>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View style={styles.positionFound}>{positionFound}</View>
        <View style={styles.rideStats}>
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
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  locationFound: {
    color: "green",
  },
  locationNotFound: {
    color: "red",
  },
  rideStats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statFont: {
    fontSize: 25
  }
});
