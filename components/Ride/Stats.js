import moment from 'moment'
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'

import {
  View,
} from 'react-native';

import { leftPad, metersToFeet } from '../../helpers'
import Stat from '../Stat'

export default class Stats extends PureComponent {
  constructor (props) {
    super(props)
    this.makeTimeRiding = this.makeTimeRiding.bind(this)
    this.makeStartTime = this.makeStartTime.bind(this)
    this.makeDistance = this.makeDistance.bind(this)
    this.makeAvgSpeed = this.makeAvgSpeed.bind(this)
    this.makeMaxSpeed = this.makeMaxSpeed.bind(this)
  }

  makeTimeRiding () {
    return moment.utc(this.props.ride.get('elapsedTimeSecs') * 1000).format('HH:mm:ss')
  }

  makeStartTime () {
    return moment(this.props.ride.get('startTime')).format('h:mm a')
  }

  makeDistance () {
    return `${this.props.ride.get('distance').toFixed(2)} mi`
  }

  makeAvgSpeed () {
    return `${(
      this.props.ride.get('distance') / (this.props.ride.get('elapsedTimeSecs') / 3600)
    ).toFixed(1)} mph`
  }

  makeMaxSpeed () {
    return `${this.props.maxSpeed.toFixed(1)} mph`
  }

  makeFinishTime () {
    return moment(this.props.ride.get('startTime')).add(this.props.ride.get('elapsedTimeSecs'), 'seconds').format('h:mm a')
  }

  makeAvgPace () {
    const sec = this.props.ride.get('elapsedTimeSecs')
    const el = sec / this.props.ride.get('distance')
    const fracMinutes = el / 60
    const minutes = Math.floor(fracMinutes)
    const seconds =  Math.floor((fracMinutes - minutes) * 60)
    return `${minutes}:${leftPad(seconds)} m/mi`
  }

  render () {
    return (
      <View style={{flex: 1, paddingTop: 20}}>
        <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
          <Stat
            imgSrc={require('../../img/distance.png')}
            text={'Distance'}
            value={this.makeDistance()}
          />
          <Stat
            imgSrc={require('../../img/elevationGain.png')}
            text={'Elevation Gain'}
            value={`${Math.round(metersToFeet(this.props.elevationGain))} ft`}
          />
        </View>
        <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
          <Stat
            imgSrc={require('../../img/clock.png')}
            text={'Start Time'}
            value={this.makeStartTime()}
          />
          <Stat
            imgSrc={require('../../img/clock.png')}
            text={'Finish Time'}
            value={this.makeFinishTime()}
          />
        </View>
        <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
          <Stat
            imgSrc={require('../../img/speedometer.png')}
            text={'Average Speed'}
            value={this.makeAvgSpeed()}
          />
          <Stat
            imgSrc={require('../../img/speedometer.png')}
            text={'Average Pace'}
            value={this.makeAvgPace()}
          />
        </View>
        <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
          <Stat
            imgSrc={require('../../img/stopwatch.png')}
            text={'Total Time Riding'}
            value={this.makeTimeRiding()}
          />
          <Stat
            imgSrc={require('../../img/maxSpeed.png')}
            text={'Max Speed'}
            value={this.makeMaxSpeed()}
          />
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
