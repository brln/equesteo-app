import React, { Component } from 'react'
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Week from './Week'

function DaysOfWeek () {
  const asNums = {0: 'M', 1: 'T', 2: 'W', 3: 'R', 4: 'F', 5: 'Sa', 6: 'Su'}
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(
      <View key={i} style={{flex: 1, justifyContent: 'center'}}>
        <Text style={{textAlign: 'center', fontSize: 15, color: "#C2C2C2"}}>{asNums[i]}</Text>
      </View>
    )
  }
  return (
    <View style={{paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#C2C2C2'}}>
      <View style={{flex: 1, flexDirection: 'row', marginBottom: 15}}>
        {days}
      </View>
    </View>
  )
}

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
    return ({item, index}) => {
       return (
         <Week
           index={index}
           mondayString={item}
           navigator={this.props.navigator}
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
      <View>
        <DaysOfWeek />
        <ScrollView>
          <FlatList
            data={mondayDates}
            keyExtractor={(i) => i}
            renderItem={this._renderItem(rideWeeks)}
          />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({});
