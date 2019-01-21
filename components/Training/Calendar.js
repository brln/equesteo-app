import React, { PureComponent } from 'react'
import {
  FlatList,
  ScrollView,
  Text,
  View,
} from 'react-native'

import Week from './Week'
import { getMonday } from '../../helpers'

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

export default class Calendar extends PureComponent {
  constructor (props) {
    super(props)
  }

  ridesToWeeks (trainings) {
    const rideWeeks = {}
    for (let ride of trainings) {
      let monday = getMonday(ride.get('startTime'))
      if (!rideWeeks[monday]) {
        rideWeeks[monday] = []
      }
      rideWeeks[monday].push(ride)
    }

    const addDays = (days, date) => {
      let newDate = new Date(date);
      newDate.setDate(date.getDate() + days);
      return newDate;
    }

    const mondayDates = Object.keys(rideWeeks)
    mondayDates.sort((a, b) => new Date(a) - new Date(b))
    const start = new Date(mondayDates[0])
    const finish = new Date(mondayDates[mondayDates.length - 1])
    for (i = start; i < finish; i = addDays(7, i)) {
      if (!rideWeeks[i]) {
        rideWeeks[i] = []
      }
    }
    return rideWeeks
  }

  _renderItem (rideWeeks) {
    return ({item, index}) => {
      return (
        <Week
          chosenHorseID={this.props.chosenHorseID}
          chosenType={this.props.chosenType}
          chosenUserID={this.props.chosenUserID}
          horses={this.props.horses}
          index={index}
          mondayString={item}
          pickType={this.pickType}
          rides={rideWeeks[item]}
          rideShouldShow={this.props.rideShouldShow}
          showRide={this.props.showRide}
          types={this.props.types}
          userID={this.props.userID}
        />
      )
    }
  }

  render() {
    const rideWeeks = this.ridesToWeeks(this.props.trainings)
    const mondayDates = Object.keys(rideWeeks)
    mondayDates.sort((a, b) => new Date(b) - new Date(a))
    return (
      <View style={{flex: 10}}>
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
