import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  }

  avgSpeed () {
    const elapsed = this.state.elapsedTime
    let hours = 0
    let minutes = 0
    let seconds = 0
    if (!(typeof(elapsed) === 'undefined') && elapsed !== 0) {
      hours = elapsed.getUTCHours()
      minutes = elapsed.getUTCMinutes()
      seconds = elapsed.getUTCSeconds()

      const totalHours = hours + (minutes / 60) + (seconds / 60 / 60)
      const milesPerHour = this.props.distance / totalHours
      return milesPerHour.toFixed(1).toString()
    } else {
      return '0.0'
    }
  }

  currentSpeed () {
    const secondToLast = this.props.rideCoords.get(-2)
    const last = this.props.rideCoords.get(-1)
    if (secondToLast && last) {
      const distance = haversine(
        secondToLast.get('latitude'),
        secondToLast.get('longitude'),
        last.get('latitude'),
        last.get('longitude')
      )
      const hours = ((last.get('timestamp') / 1000) - (secondToLast.get('timestamp') / 1000)) / 60 / 60
      return (distance / hours).toFixed(1).toString()
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

  elapsedAsString () {
    const elapsed = this.state.elapsedTime
    let hours = '00'
    let minutes = '00'
    let seconds = '00'
    if (!(typeof(elapsed) === 'undefined')) {
      hours = this.leftpad(elapsed.getUTCHours())
      minutes = this.leftpad(elapsed.getUTCMinutes())
      seconds = this.leftpad(elapsed.getUTCSeconds())
    }
    return `${hours}:${minutes}:${seconds}`
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
            <Text style={styles.statFont}>{this.currentSpeed()} <Text style={styles.unitsFont}>mi/h</Text></Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <View style={[styles.statBox, {borderTopWidth: 2, borderBottomWidth: 1, borderRightWidth: 2, borderLeftWidth: 1}]}>
            <Text style={styles.statName}>Total Time</Text>
            <Text style={styles.statFont}>{this.elapsedAsString()}</Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 2, borderLeftWidth: 1}]}>
            <Text style={styles.statName}>Avg. Speed</Text>
            <Text style={styles.statFont}>{this.avgSpeed()} <Text style={styles.unitsFont}>mi/h</Text></Text>
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
    paddingLeft: 30,
    paddingRight: 30,
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
