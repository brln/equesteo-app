import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import memoizeOne from 'memoize-one';

import { darkGrey, lightGrey } from '../../colors'
import { haversine } from '../../helpers'

const initialState = {
  starting: null,
  elapsedTime: undefined
}

export default class RideStats extends PureComponent {
  constructor () {
    super()
    this.avgSpeed = this.avgSpeed.bind(this)
    this.state = { ...initialState }
    this.elapsedAsString = this.elapsedAsString.bind(this)
    this.currentSpeed = this.currentSpeed.bind(this)
    this.timeToString = this.timeToString.bind(this)

    this.memoAvgSpeed = memoizeOne(this.avgSpeed)
    this.memoCurrentSpeed = memoizeOne(this.currentSpeed)
    this.memoTimeToString = memoizeOne(this.timeToString)
  }

  avgSpeed (time, distance) {
    const elapsed = time
    let hours = 0
    let minutes = 0
    let seconds = 0
    if (elapsed > 0 && this.props.distance) {
      hours = elapsed.getUTCHours()
      minutes = elapsed.getUTCMinutes()
      seconds = elapsed.getUTCSeconds()

      const totalHours = hours + (minutes / 60) + (seconds / 60 / 60)
      const milesPerHour = distance / totalHours
      return milesPerHour.toFixed(1).toString()
    } else {
      return '0.0'
    }
  }

  currentSpeed (rideCoords) {
    const last = rideCoords.get(-1)
    if (last) {
      return (last.get('speed') * 2.236936).toFixed(1)
    } else {
      return '0.0'
    }
  }

  componentDidMount() {
    if (this.props.startTime && !this.state.startTime) {
      this.setState({
        startTime: this.props.startTime,
        elapsedTime: new Date(new Date() - this.props.startTime)
      })
      this.renderTimer = setInterval(() => {
        this.setState({
          elapsedTime: new Date(new Date() - this.state.startTime)
        })
      }, 100)
    }
  }

  componentWillUnmount() {
    this.setState({ ...initialState })
    clearInterval(this.renderTimer)
  }

  leftpad(num) {
    const str = num.toString()
    const pad = "00"
    return pad.substring(0, pad.length - str.length) + str
  }

  timeToString (elapsed, elapsedSeconds) {
    const hours = this.leftpad(elapsed.getUTCHours())
    const minutes = this.leftpad(elapsed.getUTCMinutes())
    const seconds = this.leftpad(elapsedSeconds)
    return `${hours}:${minutes}:${seconds}`
  }

  elapsedAsString () {
    const elapsed = this.state.elapsedTime
    if (elapsed) {
      return this.memoTimeToString(elapsed, elapsed.getUTCSeconds())
    }
  }

  render () {
    return (
      <View style={styles.rideStats}>
        <View style={{flex: 1}}>
          <View style={[styles.statBox, {borderTopWidth: 2, borderBottomWidth: 1, borderRightWidth: 1, borderLeftWidth: 2}]}>
            <Text style={styles.statName}>Distance</Text>
            <Text style={styles.statFont}>
              {this.props.distance.toFixed(2).toString()} <Text style={styles.unitsFont}>mi</Text>
            </Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 1, borderLeftWidth: 2}]}>
            <Text style={styles.statName}>Current Speed</Text>
            <Text style={styles.statFont}>{this.memoCurrentSpeed(this.props.rideCoords)} <Text style={styles.unitsFont}>mi/h</Text></Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <View style={[styles.statBox, {borderTopWidth: 2, borderBottomWidth: 1, borderRightWidth: 2, borderLeftWidth: 1}]}>
            <Text style={styles.statName}>Total Time</Text>
            <Text style={styles.statFont}>{this.elapsedAsString()}</Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 2, borderLeftWidth: 1}]}>
            <Text style={styles.statName}>Avg. Speed</Text>
            <Text style={styles.statFont}>
              {this.memoAvgSpeed(this.state.elapsedTime, this.props.distance)} <Text style={styles.unitsFont}>mi/h</Text>
            </Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  rideStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statFont: {
    color: 'black',
    fontSize: 35,
    textAlign: 'center',
  },
  statName: {
    paddingLeft: 5,
    color: darkGrey,
    fontSize: 14,
  },
  statBox: {
    flex: 1,
    borderColor: lightGrey
  },
  unitsFont: {
    color: 'black',
    fontSize: 25
  }
});
