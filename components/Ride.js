import React, { Component } from 'react'
import moment from 'moment'

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import Map from './Map'
import { rideCoordsToMapCoords } from "../helpers"
import { background } from '../colors'

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
    return found ? found.name : 'none'
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 3}}>
          <Map
            rideCoords={rideCoordsToMapCoords(this.props.ride.rideCoordinates)}
            fill={true}
          />
        </View>
        <View style={{flex: 1, padding: 5}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}>
              <Text>Horse:</Text>
              <Text style={styles.statFont}>{this.whichHorse()}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>Start Time:</Text>
              <Text style={styles.statFont}>{moment(this.props.ride.startTime).format('h:mm a')}</Text>
            </View>
          </View>

          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}>
              <Text>Total Time Riding:</Text>
              <Text style={styles.statFont}>{ moment.utc(this.props.ride.elapsedTimeSecs * 1000).format('HH:mm:ss') }</Text>
            </View>

            <View style={{flex: 1}}>
              <Text>Distance:</Text>
              <Text style={styles.statFont}>{ this.props.ride.distance.toFixed(2) } mi</Text>
            </View>
          </View>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  statFont: {
    fontSize: 24
  }
});
