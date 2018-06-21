import moment from 'moment'
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'

import {
  Text,
  View,
} from 'react-native';

export default class Stats extends PureComponent {
  constructor (props) {
    super(props)
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


  render () {
    return (
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
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statFont: {
    fontSize: 24
  },

});
