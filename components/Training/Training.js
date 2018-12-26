import React, { PureComponent } from 'react'
import RNPickerSelect from 'react-native-picker-select';
import {
  FlatList,
  ScrollView,
  Text,
  View,
} from 'react-native'

import Week from './Week'
import { lightGrey } from '../../colors'
import { getMonday } from '../../helpers'
import { userName } from '../../modelHelpers/user'

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

export default class Training extends PureComponent {
  constructor (props) {
    super(props)
    this.TYPES = {
      DISTANCE: 'typeDistance',
      TYPE_TIME: 'typeTime',
      SHOW_ALL_HORSES: 'showAllHorses',
      SHOW_ALL_RIDERS: 'showAllRiders',
      NO_HORSE: 'noHorse'
    }

    this.state = {
      chosenHorseID: this.TYPES.SHOW_ALL_HORSES,
      chosenType: this.TYPES.DISTANCE,
      chosenUserID: this.TYPES.SHOW_ALL_RIDERS,
    }

    this._renderItem = this._renderItem.bind(this)
    this.horsePicker = this.horsePicker.bind(this)
    this.pickHorse = this.pickHorse.bind(this)
    this.pickRider = this.pickRider.bind(this)
    this.pickType = this.pickType.bind(this)
    this.userPicker = this.userPicker.bind(this)
  }

  ridesToWeeks (rides) {
    const rideWeeks = {}
    for (let ride of rides) {
      let monday = getMonday(ride.get('startTime'))
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
           chosenType={this.state.chosenType}
           chosenUserID={this.state.chosenUserID}
           index={index}
           mondayString={item}
           pickType={this.pickType}
           rides={rideWeeks[item]}
           rideHorses={this.props.rideHorses}
           showRide={this.props.showRide}
           types={this.TYPES}
           userID={this.props.userID}
         />
      )
    }
  }

  pickHorse (value) {
    this.setState({
      chosenHorseID: value
    })
  }

  pickType (value) {
    this.setState({
      chosenType: value
    })
  }

  pickRider (value) {
    this.setState({
      chosenUserID: value
    })
  }

  horsePicker () {
    const items = this.props.horseUsers.valueSeq().reduce((a, h) => {
      if (h.get('userID') === this.props.userID && h.get('deleted') !== true) {
        const horse = this.props.horses.get(h.get('horseID'))
        a.push({ label: horse.get('name'), value: horse.get('_id') })
      }
      return a
    }, [])
    items.push({ label: "Rides With No Horse", value: this.TYPES.NO_HORSE })
    return (
      <View style={{flex: 1, borderWidth: 1, borderColor: lightGrey}}>
        <RNPickerSelect
          value={this.state.chosenHorseID}
          items={items}
          onValueChange={this.pickHorse}
          style={{inputIOS: {fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}, underline: { borderTopWidth: 0 }}}
          placeholder={{
            label: 'All Rides',
            value: this.TYPES.SHOW_ALL_HORSES,
          }}
        />
      </View>
    )
  }

  userPicker () {
    const items = [
      {label: 'Only You', value: this.props.userID}
    ]
    const userItems = this.props.riders.valueSeq().reduce((a, r) => {
      a.push({ label: userName(r), value: r.get('_id') })
      return a
    }, [])
    const allItems = [...items, ...userItems]

    return (
      <View style={{flex: 1, borderWidth: 1, borderColor: lightGrey}}>
        <RNPickerSelect
          value={this.state.chosenUserID}
          items={allItems}
          onValueChange={this.pickRider}
          style={{inputIOS: {fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}, underline: { borderTopWidth: 0 }}}
          placeholder={{
            label: 'All Riders',
            value: this.TYPES.SHOW_ALL_RIDERS,
          }}
        />
      </View>
    )
  }

  render() {
    const rideWeeks = this.ridesToWeeks(this.props.rides)
    const mondayDates = Object.keys(rideWeeks)
    mondayDates.sort((a, b) => new Date(b) - new Date(a))
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          { this.horsePicker() }
          { this.userPicker() }
        </View>
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
      </View>
    )
  }
}
