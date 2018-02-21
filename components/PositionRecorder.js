import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';

type Props = {};

export default class PositionRecorder extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      startingPosition: null,
      lastLat: null,
      lastLong: null,
      lastAltitude: null,
      positions: []
    };
    this.watchID = null;
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  componentWillUnmount () {
     navigator.geolocation.clearWatch(this.watchID);
  }

  saveRide () {
    this.props.saveRide(this.state.positions)
  }

  startRide () {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ startingPosition: position });
      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 1000 }
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      thisPosition = {
        lt: position.coords.latitude,
        lg: position.coords.longitude,
        ts: position.coords.timestamp,
      }
      this.setState({
        positions: [...this.state.positions, thisPosition],
        lastLat: position.coords.latitude,
        lastLong: position.coords.longitude,
        lastAltitude: position.coords.altitude,
       });
      },
      null,
      {enableHighAccuracy: true, timeout: 1000 * 60 * 10, maximumAge: 10000, distanceFilter: 20}
    )
  }

  render() {
    let positionFound = <Text>Position Not Yet Found</Text>
    if (this.state.startingPosition) {
      positionFound = <Text>Starting Position Found!</Text>
    }
    return (
      <View style={styles.container}>
        {positionFound}
        <Button onPress={this.startRide} title="Start Ride"/>
        <Text>Latitude: {this.state.lastLat}</Text>
        <Text>Longitude: {this.state.lastLong}</Text>
        <Text>Altitude: {this.state.lastAltitude}</Text>
        <Button onPress={this.saveRide} title="Save Ride"/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  }
});
