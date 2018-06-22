import moment from 'moment'
import React, { Component } from 'react'

import { RIDE } from '../../screens'
import { formattedWeekString } from "../../helpers"


import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

function RideDay (props) {
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <TouchableHighlight onPress={() => { props.showRide(props.ride)} }>
        <Text style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold'}}
        >
          { props.ride.distance.toFixed(1) }
        </Text>
      </TouchableHighlight>
    </View>
  )
}

function ZeroDay (props) {
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <Text style={{
        textAlign: 'center',
        fontSize: 10}}
      >
        0
      </Text>
    </View>
  )
}

export default class Week extends Component {
  constructor (props) {
    super(props)
    this.days = this.days.bind(this)
    this.showRide = this.showRide.bind(this)
  }

  showRide (ride) {
    this.props.navigator.push({
      screen: RIDE,
      title: ride.name,
      passProps: {
        rideID: ride._id,
      },
      navigatorButtons: {
        leftButtons: [],
        rightButtons: [
        {
          icon: require('../../img/threedot.png'),
          id: 'dropdown',
        }
      ]
      },
      animationType: 'slide-up',
    });
  }

  days (mondayString) {
    const days = []
    const start = moment(new Date(mondayString))
    let total = 0.0
    for (let i = 0; i < 7; i++) {
      const eachDay = moment(start).add(i, 'days')
      const daysRides = []
      for (let ride of this.props.rides) {
        if (moment(ride.startTime).date() === eachDay.date()) {
          daysRides.push(ride)
          const distance = ride.distance.toFixed(1)
          total += parseFloat(distance)
        }
      }

      if (daysRides.length === 0) {
        days.push(<ZeroDay key={i}/>)
      } else {
        days.push(
          <RideDay
            key={i}
            ride={daysRides[0]}
            showRide={this.showRide}
          />
        )
      }
    }
    return { days, total }
  }

  render () {
    const weekData = this.days(this.props.mondayString)
    return (
      <View style={{flex: 1, flexDirection: 'column', paddingTop: 10, paddingBottom: 10, marginBottom: 10, backgroundColor: "#AAAAAA"}}>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            {formattedWeekString(this.props.mondayString)}
          </Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', marginBottom: 15}}>
          {weekData.days}
        </View>
        <View>
          <Text style={{textAlign: 'center'}}>Total: { weekData.total.toFixed(1) }</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({});
