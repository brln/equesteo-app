import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';

import { stopLocationTracking } from '../../actions'
import RideDetails from './RideDetails'
import RideStats from './RideStats'
import GPSStatus from './GPSStatus'

const initialState = {
  enteringDetails: false,
  hasPosition: false,
  positions: [],
  recording: false,
  startingTime: null,
  lastLat: null,
  lastLong: null,
  totalDistance: 0.0
}

export default class RideRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = Object.assign({}, initialState)
    this.watchID = null;
    this.dontSaveRide = this.dontSaveRide.bind(this)
    this.rideComplete = this.rideComplete.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  haversine(lat1, lon1, lat2, lon2) {
    toRad = (deg) => {
     return deg * Math.PI / 180;
    }

    if (!lat1 || !lon1) {
      return 0
    }

    const R = 3959; // mi
    const x1 = lat2 - lat1
    const dLat = toRad(x1)
    const x2 = lon2 - lon1
    const dLon = toRad(x2)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  componentWillReceiveProps(newProps) {
    const position = newProps.lastLocation
    if (this.state.recording) {
      const thisPosition = {
        lt: position.coords.latitude,
        lg: position.coords.longitude,
        ts: position.timestamp,
      }
      const newDistance = this.haversine(
        this.state.lastLat,
        this.state.lastLong,
        position.coords.latitude,
        position.coords.longitude
      )
      this.setState({
        hasPosition: true,
        lastLat: position.coords.latitude,
        lastLong: position.coords.longitude,
        positions: [...this.state.positions, thisPosition],
        totalDistance: this.state.totalDistance + newDistance
      })
    } else if (newProps.lastLocation) {
      this.setState({
        hasPosition: true
      })
    }
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

  dontSaveRide () {
    this.setState(Object.assign({}, initialState))
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
        <Button onPress={this.startRide} title="Start Ride"/>
      </View>
    )
    if (this.state.recording) {
      startButton = null
      rideStats = (
        <View>
          <RideStats
            startingTime={this.state.startingTime}
            totalDistance={this.state.totalDistance}
          />
          <View style={styles.rideComplete}>
            <Button onPress={this.rideComplete} title="Ride Complete"/>
          </View>
        </View>
      )
    } else if (this.state.enteringDetails) {
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
    paddingTop: 30,
    alignSelf: 'center',
  }
});
