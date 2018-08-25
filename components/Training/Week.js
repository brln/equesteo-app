import moment from 'moment'
import React, { Component } from 'react'

import { lightGrey } from '../../colors'
import { RIDE } from '../../screens'
import { formattedWeekString } from "../../helpers"

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function RideDay (props) {
  let showString
  if (props.chosenType === props.types.DISTANCE) {
    showString = (
      <Text style={{
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold'}}
      >
        {props.ride.get('distance').toFixed(1)}
      </Text>
    )
  } else if (props.chosenType === props.types.TYPE_TIME) {
    showString = props.timeString(
      props.ride.get('elapsedTimeSecs'),
      {textAlign: 'center', fontSize: 15, fontWeight: 'bold'},
      false
    )
  }
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <TouchableOpacity onPress={() => { props.showRide(props.ride)} }>
        { showString }
      </TouchableOpacity>
    </View>
  )
}

function MultiRideDay (props) {
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      {
        props.rides.map((r) => {
          let showString
          if (props.chosenType === props.types.DISTANCE) {
            showString = (
              <Text style={{
                textAlign: 'center',
                fontSize: 25,
                fontWeight: 'bold'}}
              >
                {r.get('distance').toFixed(1)}
              </Text>
            )
          } else if (props.chosenType === props.types.TYPE_TIME) {
            showString = props.timeString(
              r.get('elapsedTimeSecs'),
              {textAlign: 'center', fontSize: 15, fontWeight: 'bold'},
              false
            )
          }
          return (
            <TouchableOpacity key={r.get('_id')} onPress={() => { props.showRide(r)} }>
              { showString }
            </TouchableOpacity>
          )
        })
      }
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
    let rightButtons = []
    if (this.props.userID === ride.get('userID')) {
      rightButtons = [
        {
          title: "Edit",
          id: 'edit',
        },
        {
          title: "Delete",
          id: 'delete',
        }
      ]
    }
    this.props.navigator.push({
      screen: RIDE,
      title: ride.get('name'),
      passProps: {
        rideID: ride.get('_id'),
      },
      navigatorButtons: {
        leftButtons: [],
        rightButtons,
      },
      animationType: 'slide-up',
    });
  }

  days (mondayString) {
    const days = []
    const start = moment(new Date(mondayString))
    let totalDistance = 0.0
    let totalTime = 0
    let weekHasRides = false
    for (let i = 0; i < 7; i++) {
      const eachDay = moment(start).add(i, 'days')
      const daysRides = []
      for (let ride of this.props.rides) {
        const showingHorseID = ride.get('horseID') ? ride.get('horseID') : null
        if (moment(ride.get('startTime')).date() === eachDay.date()
          && (
            showingHorseID === this.props.chosenHorseID
            || this.props.chosenHorseID === this.props.types.SHOW_ALL_HORSES
          ) && (
            ride.get('userID') === this.props.chosenUserID
            || this.props.chosenUserID === this.props.types.SHOW_ALL_RIDERS
          )

        ) {
          daysRides.push(ride)
          totalDistance += ride.get('distance')
          totalTime += ride.get('elapsedTimeSecs')
        }
      }

      if (daysRides.length === 0) {
        days.push(<ZeroDay key={i}/>)
      } else if (daysRides.length === 1) {
        weekHasRides = true
        days.push(
          <RideDay
            key={i}
            ride={daysRides[0]}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={this.props.chosenType}
            timeString={this.timeString}
          />
        )
      } else if (daysRides.length > 1) {
        weekHasRides = true
        days.push(
          <MultiRideDay
            key={i}
            rides={daysRides}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={this.props.chosenType}
            timeString={this.timeString}
          />
        )
      }
    }
    return { days, totalDistance, totalTime, weekHasRides }
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
    const weekData = this.days(this.props.mondayString)
    if (weekData.weekHasRides) {
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
          </View>
        </View>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({});
