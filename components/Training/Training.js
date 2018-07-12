import React, { Component } from 'react'
import {
  FlatList,
  Picker,
  ScrollView,
  StyleSheet,
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

export default class Training extends Component {
  constructor (props) {
    super(props)
    this.state = {
      chosenHorseID: 1
    }
    this._renderItem = this._renderItem.bind(this)
    this.horsePicker = this.horsePicker.bind(this)
    this.pickHorse = this.pickHorse.bind(this)
  }

  ridesToWeeks (rides) {
    const rideWeeks = {}
    for (let ride of rides) {
      let monday = getMonday(ride.startTime)
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
           chosenHorseID={this.state.chosenHorseID}
           index={index}
           mondayString={item}
           navigator={this.props.navigator}
           rides={rideWeeks[item]}
         />
      )
    }
  }

  pickHorse (value) {
    this.setState({
      chosenHorseID: value
    })
  }

  horsePicker () {
    return (
      <View style={{borderWidth: 1, borderColor: 'black'}}>
        <Picker selectedValue={this.state.chosenHorseID} onValueChange={this.pickHorse}>
          <Picker.Item key="everyone" label="Everyone" value={1} />
          {
            this.props.horses.filter(h => h.userID === this.props.user._id).map(h => {
              return <Picker.Item key={h._id} label={h.name} value={h._id} />
            })
          }
          <Picker.Item key="none" label="No Horse" value={undefined} />
        </Picker>
      </View>
    )
  }

  render() {
    const rideWeeks = this.ridesToWeeks(this.props.rides)
    const mondayDates = Object.keys(rideWeeks)
    mondayDates.sort((a, b) => new Date(b) - new Date(a))
    return (
      <View style={{flex: 1}}>
        { this.horsePicker() }
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
