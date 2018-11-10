import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import memoizeOne from 'memoize-one';

import { darkGrey, lightGrey } from '../../colors'
import { elapsedTime, metersToFeet, speedGradient, timeToString } from '../../helpers'

const initialState = {
  elapsedTime: undefined
}

export default class RideStats extends PureComponent {
  constructor () {
    super()
    this.avgSpeed = this.avgSpeed.bind(this)
    this.state = { ...initialState }
    this.elapsedAsString = this.elapsedAsString.bind(this)
    this.currentAltitude = this.currentAltitude.bind(this)
    this.currentSpeed = this.currentSpeed.bind(this)

    this.memoAvgSpeed = memoizeOne(this.avgSpeed)
    this.memoCurrentAltitude = memoizeOne(this.currentAltitude)
    this.memoCurrentSpeed = memoizeOne(this.currentSpeed)
    this.memoTimeToString = memoizeOne(timeToString)
  }

  avgSpeed (time, distance) {
    const elapsed = time
    if (elapsed > 0 && distance) {
      const totalHours = time / 60 / 60
      const milesPerHour = distance / totalHours
      return milesPerHour.toFixed(1).toString()
    } else {
      return '0.0'
    }
  }

  currentSpeed (lastLocation) {
    let speed = '0.0'
    if (lastLocation) {
      const found = lastLocation.get('speed')
      if (found || found === 0) {
        speed = (lastLocation.get('speed') * 2.236936).toFixed(1)
      } else {
        speed = '-'
      }
    }
    return speed
  }


  currentAltitude (lastElevation) {
    let elevation = '0'
    if (lastElevation) {
      const found = lastElevation.get('elevation')
      if (found) {
        elevation = Math.round(metersToFeet(lastElevation.get('elevation')))
      } else {
        elevation = '-'
      }
    }
    return elevation
  }


  componentDidMount() {
    const startTime = this.props.currentRide.get('startTime')
    const now = new Date()
    const nowElapsed = elapsedTime(
      startTime,
      now,
      this.props.currentRide.get('pausedTime'),
      this.props.currentRide.get('lastPauseStart')
    )
    if (startTime && !this.state.startTime) {
      this.setState({
        elapsedTime: nowElapsed,
      })
      this.renderTimer = setInterval(() => {
        const now = new Date()
        const newElapsedTime = elapsedTime(
          startTime,
          now,
          this.props.currentRide.get('pausedTime'),
          this.props.currentRide.get('lastPauseStart')
        )
        this.setState({
          elapsedTime: newElapsedTime
        })
      }, 100)
    }
  }

  componentWillUnmount() {
    this.setState({ ...initialState })
    clearInterval(this.renderTimer)
  }

  elapsedAsString () {
    const elapsed = this.state.elapsedTime
    if (elapsed) {
      return this.memoTimeToString(elapsed)
    }
  }

  render () {
    const distance = this.props.currentRide.get('distance')
    const speed = this.memoCurrentSpeed(this.props.lastLocation)
    return (
      <View style={styles.rideStats}>
        <View style={{flex: 1}}>
          <View style={[styles.statBox, {borderTopWidth: 2, borderBottomWidth: 1, borderRightWidth: 1, borderLeftWidth: 2}]}>
            <Text style={styles.statName}>Distance</Text>
            <Text style={styles.statFont}>
              {distance.toFixed(2)} <Text style={styles.unitsFont}>mi</Text>
            </Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 1, borderLeftWidth: 2}]}>
            <Text style={styles.statName}>Current Speed</Text>
            <Text style={styles.statFont}>{speed} <Text style={styles.unitsFont}>mi/h</Text></Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 1, borderLeftWidth: 2}]}>
            <Text style={styles.statName}>Altitude</Text>
            <Text style={styles.statFont}>{this.memoCurrentAltitude(this.props.lastElevation)} <Text style={styles.unitsFont}>ft</Text></Text>
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
              {this.memoAvgSpeed(this.state.elapsedTime, distance)} <Text style={styles.unitsFont}>mi/h</Text>
            </Text>
          </View>
          <View style={[styles.statBox, {borderTopWidth: 1, borderBottomWidth: 2, borderRightWidth: 2, borderLeftWidth: 1}]}>
            <Text style={styles.statName}>Elevation Gain</Text>
            <Text style={styles.statFont}>
              {Math.round(metersToFeet(this.props.currentRideElevations.get('elevationGain')))} <Text style={styles.unitsFont}>ft</Text>
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
