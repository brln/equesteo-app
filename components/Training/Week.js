import memoizeOne from 'memoize-one'
import moment from 'moment'
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { darkGrey, lightGrey } from '../../colors'
import { formattedWeekString, metersToFeet } from "../../helpers"
import { rideColor } from '../../modelHelpers/training'

function RideDay (props) {
  const horseColor =  rideColor(props.ride, props.rideHorses, props.horses, null)
  let showString
  if (props.chosenType === props.types.DISTANCE) {
    showString = (
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: horseColor
        }}
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
  } else if (props.chosenType === props.types.TYPE_GAIN) {
    showString = (
      <Text style={{
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold'}}
      >
        {Math.round(metersToFeet(props.ride.get('elevationGain')) || 0)}
      </Text>
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
          const horseColor =  rideColor(r, props.rideHorses, props.horses, null)
          let showString
          if (props.chosenType === props.types.DISTANCE) {
            showString = (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 25,
                  fontWeight: 'bold',
                  color: horseColor
                }}
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
          } else if (props.chosenType === props.types.TYPE_GAIN) {
            showString = (
              <Text style={{
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 'bold'}}
              >
                {Math.round(metersToFeet(r.get('elevationGain'))) || 0}
              </Text>
            )
          }
          return (
            <TouchableOpacity key={r.get('rideID')} onPress={props.showRide(r)}>
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
    this.showRide = this.showRide.bind(this)

    this.memoizeDays = memoizeOne(this.days.bind(this))
  }

  showRide (ride) {
    return () => {
      this.props.showRide(ride)
    }
  }

  days (mondayString) {
    const days = []
    const start = moment(new Date(mondayString))
    let totalDistance = 0.0
    let totalTime = 0
    let totalGain = 0
    for (let i = 0; i < 7; i++) {
      const eachDay = moment(start).add(i, 'days')
      const daysRides = []
      for (let ride of this.props.rides) {
        // @TODO: oof, super inefficient
        if (this.props.rideShouldShow(ride, eachDay)) {
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
            horses={this.props.horses}
            key={i}
            ride={daysRides[0]}
            rideHorses={this.props.rideHorses}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={this.props.chosenType}
            timeString={this.timeString}
          />
        )
      } else if (daysRides.length > 1) {
        days.push(
          <MultiRideDay
            horses={this.props.horses}
            key={i}
            rides={daysRides}
            rideHorses={this.props.rideHorses}
            showRide={this.showRide}
            types={this.props.types}
            chosenType={this.props.chosenType}
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
    const weekData = this.memoizeDays(this.props.mondayString)
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
