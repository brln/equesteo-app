import moment from 'moment'
import React, { Component } from 'react'

import { lightGrey } from '../../colors'
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
      <TouchableOpacity onPress={props.showRide(props.ride)}>
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
            <TouchableOpacity key={r.get('_id')} onPress={props.showRide(r)}>
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
    this.pickTypeDistance = this.pickTypeDistance.bind(this)
    this.pickTypeTime = this.pickTypeTime.bind(this)
    this.rideShouldShow = this.rideShouldShow.bind(this)
  }

  showRide (ride) {
    return () => {
      this.props.showRide(ride)
    }
  }

  rideShouldShow (ride, day) {
    const happenedOnDay = moment(ride.get('startTime')).date() === day.date()
    const riderShouldBeShowing = ride.get('userID') === this.props.chosenUserID
      || this.props.chosenUserID === this.props.types.SHOW_ALL_RIDERS
    if (happenedOnDay && riderShouldBeShowing) {
      const showingNoHorse = this.props.chosenHorseID === this.props.types.NO_HORSE
      const showingHorseIDs = this.props.rideHorses.valueSeq().filter(rh => {
        return rh.get('rideID') === ride.get('_id')
      }).map(rh => {
        return rh.get('horseID')
      }).toList()
      return showingHorseIDs.contains(this.props.chosenHorseID)
        || this.props.chosenHorseID === this.props.types.SHOW_ALL_HORSES
        || !showingHorseIDs.count() && showingNoHorse && !ride.get('horseID') // remove this last part when > 43
        || (!showingHorseIDs.count() && ride.get('horseID') && ride.get('horseID') === this.props.chosenHorseID) // remove when everyone > 43
    } else {
      return false
    }
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
        if (this.rideShouldShow(ride, eachDay)) {
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

  pickTypeDistance () {
    this.props.pickType('typeDistance')
  }

  pickTypeTime () {
    this.props.pickType('typeTime')
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
            <TouchableOpacity style={{flex: 1}} onPress={this.pickTypeDistance}>
              <Text style={{textAlign: 'center', fontSize: 20}}>{ weekData.totalDistance.toFixed(1) } mi</Text>
              <Text style={{textAlign: 'center', fontSize: 10}}>DISTANCE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}}a onPress={this.pickTypeTime}>
              {this.timeString(weekData.totalTime, {textAlign: 'center', fontSize: 20})}
              <Text style={{textAlign: 'center', fontSize: 10}}>TIME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({});
