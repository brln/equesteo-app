import React, { Component } from 'react'
import moment from 'moment'

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import Map from './Map'
import { rideCoordsToMapCoords } from "../helpers"

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.whichHorse = this.whichHorse.bind(this)
  }

  whichHorse () {
    let found = null
    for (let horse of this.props.horses) {
      if (horse.id === this.props.ride.horseID) {
        found = horse
      }
    }
    return found
  }

  render() {
    return (
      <View style={styles.container}>
        <Map
          rideCoords={rideCoordsToMapCoords(this.props.ride.rideCoordinates)}
        />
        <View>
          <Text>Start Time: {moment(this.props.ride.startTime).format('MMMM Do YYYY, h:mm a')}</Text>
          <Text>Total Time Riding: { moment.utc(this.props.ride.elapsedTimeSecs * 1000).format('HH:mm:ss') }</Text>
          <Text>Distance: { this.props.ride.distance.toFixed(2) } mi</Text>
          <Text>Horse: {this.whichHorse().name}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
