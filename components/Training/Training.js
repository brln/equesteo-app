import React, { Component } from 'react'
import {
  FlatList,
  ScrollView,
  StyleSheet
} from 'react-native'

import Week from './Week'

export default class Training extends Component {
  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
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

  getMonday (d) {
    d = new Date(d);
    d.setHours(0, 0, 0, 0)
    let day = d.getDay()
    let diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    return new Date(d.setDate(diff))
  }

  ridesToWeeks (rides) {
    const rideWeeks = {}
    for (let ride of rides) {
      let monday = this.getMonday(ride.startTime)
      if (!rideWeeks[monday]) {
        rideWeeks[monday] = []
      }
      rideWeeks[monday].push(ride)
    }
    return rideWeeks
  }

  _renderItem (rideWeeks) {
    return ({item}) => {
       return (
         <Week
           mondayString={item}
           rides={rideWeeks[item]}
         />
      )
    }
  }

  render() {
    const rideWeeks = this.ridesToWeeks(this.props.rides)
    const mondayDates = Object.keys(rideWeeks)
    mondayDates.sort((a, b) => new Date(b) - new Date(a))
    return (
      <ScrollView>
        <FlatList
          data={mondayDates}
          keyExtractor={(i) => i}
          renderItem={this._renderItem(rideWeeks)}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({});
