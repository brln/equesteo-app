import React, { Component } from 'react'
import moment from 'moment'

import { staticMap } from '../helpers'

import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
} from 'react-native';

import Map from './Map'
import { rideCoordsToMapCoords } from "../helpers"
import { background } from '../colors'
import PhotosBytimestamp from './PhotosByTimestamp'

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.whichHorse = this.whichHorse.bind(this)
  }

  whichHorse () {
    let found = null
    for (let horse of this.props.horses) {
      if (horse._id === this.props.ride.horseID) {
        found = horse
      }
    }
    return found ? found.name : 'none'
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={{flex: 3}}>
            <Image
              source={{uri: staticMap(this.props.ride)}}
              style={{height: 250, width: null, flex: 1}}
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
          <View style={{height: 800}}>
            <PhotosBytimestamp
              photosByID={this.props.ride.photosByID}
              profilePhotoID={this.props.ride.profilePhotoID}
            />
          </View>
        </View>
      </ScrollView>
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
