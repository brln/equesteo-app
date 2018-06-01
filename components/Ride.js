import React, { Component } from 'react'
import { Navigation } from 'react-native-navigation'
import moment from 'moment'

import { staticMap } from '../helpers'

import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { MAP } from '../screens'
import { background } from '../colors'
import PhotosByTimestamp from './PhotosByTimestamp'

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.fullscreenMap = this.fullscreenMap.bind(this)
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

  fullscreenMap () {
    Navigation.showModal({
      screen: MAP,
      title: 'Map',
      animationType: 'slide-up',
      passProps: {
        rideCoords: this.props.ride.rideCoordinates
      }
    })
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={{flex: 3}}>
            <TouchableOpacity
              onPress={this.fullscreenMap}
            >
              <Image
                source={{uri: staticMap(this.props.ride)}}
                style={{height: 250, width: null, flex: 1}}
              />
            </TouchableOpacity>
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
            <PhotosByTimestamp
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
