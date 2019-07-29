import memoizeOne from 'memoize-one'
import moment from 'moment'
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { lightGrey } from '../../colors'
import { formattedWeekString, metersToFeet } from "../../helpers"
import RideDay from './RideDay'
import MultiRideDay from './MultiRideDay'
import ZeroDay from './ZeroDay'

export default class Week extends Component {
  constructor (props) {
    super(props)
    this.showRide = this.showRide.bind(this)

    this.memoizeDays = memoizeOne(this.days.bind(this))
  }

  showRide (ride) {
    return () => {
      this.props.showRide(ride)
    }
  }

  days (mondayString, rides, horses, chosenType, chosenHorseID, chosenUserID) {
    const days = []
    const start = moment(new Date(mondayString))
    let totalDistance = 0.0
    let totalTime = 0
    let totalGain = 0
    const sortedRides = {}
    for (let ride of rides) {
      const rideDay = moment(ride.get('startTime')).startOf('day')
      if (!sortedRides[rideDay]) {
        sortedRides[rideDay] = []
      }
      sortedRides[rideDay].push(ride)
    }


    for (let i = 0; i < 7; i++) {
      const eachDay = moment(start).add(i, 'days')
      const daysRides = []
      const day = sortedRides[eachDay] || []
      for (let ride of day) {
        if (this.props.rideShouldShow(ride, eachDay, chosenUserID, chosenHorseID)) {
          daysRides.push(ride)
          totalDistance += ride.get('distance')
          totalTime += ride.get('elapsedTimeSecs')
          totalGain += ride.get('elevationGain') || 0
        }
      }

      if (daysRides.length === 0) {
        days.push(<ZeroDay key={i}/>)
      } else if (daysRides.length === 1) {
        days.push(
          <RideDay
            horses={horses}
            key={i}
            ride={daysRides[0]}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={chosenType}
            timeString={this.timeString}
          />
        )
      } else if (daysRides.length > 1) {
        days.push(
          <MultiRideDay
            horses={horses}
            key={i}
            rides={daysRides}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={chosenType}
            timeString={this.timeString}
          />
        )
      }
    }
    return { days, totalDistance, totalTime, totalGain }
  }

  timeString (seconds, style, showSpace=true) {
    const space = showSpace ? ' ' : ''
    const hours = seconds / 3600
    const justHours = Math.floor(hours)
    const minutes = Math.round((hours - justHours) * 60)
    if (justHours > 0) {
      return <Text style={style}>{`${justHours}h${space}${minutes}m`}</Text>
    } else {
      return <Text style={style}>{`${minutes}m`}</Text>
    }
  }

  render () {
    const weekData = this.memoizeDays(
      this.props.mondayString,
      this.props.rides,
      this.props.horses,
      this.props.chosenType,
      this.props.chosenHorseID,
      this.props.chosenUserID,
    )
    return (
      <View style={{flex: 1, flexDirection: 'column', paddingTop: 10, paddingBottom: 10, marginBottom: 10, backgroundColor: lightGrey}}>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            {formattedWeekString(this.props.mondayString)}
          </Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', marginBottom: 15}}>
          {weekData.days}
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center', fontSize: 20}}>{ weekData.totalDistance.toFixed(1) } mi</Text>
            <Text style={{textAlign: 'center', fontSize: 10}}>DISTANCE</Text>
          </View>
          <View style={{flex: 1}}>
            {this.timeString(weekData.totalTime, {textAlign: 'center', fontSize: 20})}
            <Text style={{textAlign: 'center', fontSize: 10}}>TIME</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center', fontSize: 20}}>{ Math.round(metersToFeet(weekData.totalGain)) } ft</Text>
            <Text style={{textAlign: 'center', fontSize: 10}}>GAIN</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({});
