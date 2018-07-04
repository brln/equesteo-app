import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { black, brand, green, white } from '../../colors'
import GPSStatus from './GPSStatus'
import { unixTimeNow } from "../../helpers"
import RidingMap from './RidingMap'
import RideStats from './RideStats'
import { RIDE_DETAILS } from "../../screens"

export default class RideRecorder extends Component {
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
      this.gpsTimeout = setTimeout(() => {
        this.setState({showGPS: false})
      }, 2000)
    }
  }

  componentWillUnmount () {
    clearInterval(this.gpsTimeout)
  }

  rideComplete () {
    if (this.props.currentRide.rideCoordinates.length > 0) {
      const elapsedTime = (unixTimeNow() - this.props.currentRide.startTime) / 1000
      this.props.navigator.push({
        screen: RIDE_DETAILS,
        title: 'Ride Details',
        passProps: {
          horses: this.props.horses,
          elapsedTime,
        },
        navigatorStyle: {
          navBarBackgroundColor: brand,
          topBarElevationShadowEnabled: false,
          navBarTextColor: white,
          navBarButtonColor: white,
        },
        navigatorButtons: {},
        animationType: 'slide-up',
      });
    } else {
      alert('Discarding empty ride.')
      this.props.discardRide()
    }
    this.props.stopLocationTracking()
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
              rideCoords={this.props.currentRide.rideCoordinates}
              lastLocation={this.props.lastLocation}
            />
          </View>
          <View style={styles.bottomSection}>
            <RideStats
              appState={this.props.appState}
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
  },
  bottomSection: {
    flex: 1,
  },
  rideComplete: {
    backgroundColor: brand,
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
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
