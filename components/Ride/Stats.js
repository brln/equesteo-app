import moment from 'moment'
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'

import {
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import Stat from '../Stat'

export default class Stats extends PureComponent {
  constructor (props) {
    super(props)
    this.whichHorse = this.whichHorse.bind(this)
    this.makeTimeRiding = this.makeTimeRiding.bind(this)
    this.makeStartTime = this.makeStartTime.bind(this)
    this.makeDistance = this.makeDistance.bind(this)
    this.makeAvgSpeed = this.makeAvgSpeed.bind(this)
    this.makeMaxSpeed = this.makeMaxSpeed.bind(this)
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

  makeTimeRiding () {
    return moment.utc(this.props.ride.elapsedTimeSecs * 1000).format('HH:mm:ss')
  }

  makeStartTime () {
    return moment(this.props.ride.startTime).format('h:mm a')
  }

  makeDistance () {
    return `${this.props.ride.distance.toFixed(2)} mi`
  }

  makeAvgSpeed () {
    return `${(
      this.props.ride.distance / (this.props.ride.elapsedTimeSecs / 3600)
    ).toFixed(2)} mph`
  }

  makeMaxSpeed () {
    return `${this.props.maxSpeed.toFixed(2)} mph`
  }

  render () {
    return (
      <Card style={{flex: 1}}>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
          <View style={{flex: 1, paddingTop: 20}}>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <Stat
                imgSrc={require('../../img/breed.png')}
                text={'Horse'}
                value={this.whichHorse()}
              />
              <Stat
                imgSrc={require('../../img/clock.png')}
                text={'Start Time'}
                value={this.makeStartTime()}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <Stat
                imgSrc={require('../../img/stopwatch.png')}
                text={'Total Time Riding'}
                value={this.makeTimeRiding()}
              />
              <Stat
                imgSrc={require('../../img/distance.png')}
                text={'Distance'}
                value={this.makeDistance()}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <Stat
                imgSrc={require('../../img/speedometer.png')}
                text={'Average Speed'}
                value={this.makeAvgSpeed()}
              />
              <Stat
                imgSrc={require('../../img/maxSpeed.png')}
                text={'Max Speed'}
                value={this.makeMaxSpeed()}
              />
            </View>
          </View>
        </CardItem>
      </Card>
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
