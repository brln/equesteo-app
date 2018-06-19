import moment from 'moment'
import React, { Component } from 'react'


import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class Week extends Component {
  constructor (props) {
    super(props)
    this.days = this.days.bind(this)
  }

  days (mondayString) {
    const days = []
    const start = moment(new Date(mondayString))
    for (let i = 0; i < 7; i++) {
      const eachDay = moment(start).add(i, 'days')
      const daysRides = []
      for (let ride of this.props.rides) {
        if (moment(ride.startTime).date() === eachDay.date()) {
          daysRides.push(ride.distance.toFixed(1))
        }
      }
      let fontSize = 25
      if (daysRides.length === 0) {
        daysRides.push(0)
        fontSize = 10
      }
      days.push(
        <View key={i} style={{flex: 1, justifyContent: 'center'}}>
          <Text style={{textAlign: 'center', fontSize: fontSize, fontWeight: 'bold'}}>{daysRides.join(' ')}</Text>
        </View>
      )
    }
    return days
  }

  render () {
    const start = moment(new Date(this.props.mondayString))
    const startString = start.format('MMMM D')
    let end = moment(start).add(6, 'days')
    let endString = end.format('D YYYY')
    if (start.month() !== end.month()) {
      endString = end.format('MMMM D YYYY')
    }
    return (
      <View style={{flex: 1, flexDirection: 'column', paddingBottom: 30}}>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            {startString} - {endString}
          </Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', marginBottom: 15}}>
          {this.days(this.props.mondayString)}
        </View>
        <View>
          <Text style={{textAlign: 'center'}}>Total: 23.1</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({});
