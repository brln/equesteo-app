import { List } from 'immutable'
import moment from 'moment'
import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
} from 'native-base';
import {
  Dimensions,
  ScrollView,
  Text,
  View
} from 'react-native';

import { brand, darkBrand, lightGrey } from '../../colors'
import { shade } from '../../helpers'

const { width } = Dimensions.get('window')
const SQUARE_FRACTION = 30

class DaySquare extends PureComponent {
  render () {
    const trainings = this.props.trainings.get(this.props.day.toISOString()) || List()
    let bgColor = lightGrey
    if (trainings.count()) {
      const distance = trainings.reduce((accum, t) => {
        accum += t.get('distance')
        return accum
      }, 0)

      const MIN_DISTANCE_FULL_BADGE = 10
      let diff = MIN_DISTANCE_FULL_BADGE - distance
      if (diff < 0) {
        diff = 0
      }
      const remaining = diff / MIN_DISTANCE_FULL_BADGE

      bgColor = shade(brand, remaining)
    } else if (this.props.day > moment()) {
      bgColor = 'white'
    }
    return (
      <View
        style={{
          borderColor: 'white',
          borderWidth: 1,
          height: width / SQUARE_FRACTION,
          width: width / SQUARE_FRACTION,
          backgroundColor: bgColor
        }}
      />
    )
  }
}

class WeekColumn extends PureComponent {
  render () {
    return (
      <View style={{width: width / SQUARE_FRACTION}}>
        {this.props.days}
      </View>
    )
  }
}


export default class SquaresCard extends PureComponent {
  constructor (props) {
    super(props)
    this.generateSquares = this.generateSquares.bind(this)
    this.squaresContainer = null
  }

  componentDidMount () {
    setTimeout(() => {
      if (this.squaresContainer) {
        this.squaresContainer.scrollToEnd()
      }
    }, 600)
  }

  generateSquares () {
    const weeks = []
    const monday = moment().hour(0).minute(0).second(0).millisecond(0).day(1)

    const dayLabels = []
    for (let k = 1; k <= 7; k++ % 6) {
      if (k === 1 || k === 4 || k === 7) {
        dayLabels.push(
          <View key={`${k}label`} style={{height: width / SQUARE_FRACTION}}>
            <Text key={`${k}label`} style={{fontSize: 10}}>{moment().day(k).format("ddd")}</Text>
          </View>
        )
      } else {
        dayLabels.push(
          <View key={`${k}label`} style={{height: width / SQUARE_FRACTION}} />
        )
      }
    }
    weeks.push(
      <View key="labelcol" style={{width: width / 10, marginTop: width / 20}}>
        {dayLabels}
      </View>
    )

    for (let i = 52; i >= 0; i--) {
      const days = []
      let containsFirstOfMonth = null
      for (let j = 0; j <= 6; j++) {
        const newDay = moment(monday).subtract(i, 'weeks').add(j, 'days')
        if (newDay.date() === 1) {
          containsFirstOfMonth = newDay.month()
        }
        days.push(<DaySquare key={`${i}${j}`} day={newDay} trainings={this.props.trainings}/>)
      }
      if (containsFirstOfMonth !== null) {
        days.unshift(
          <View key={`${i}top`} style={{flex: 1, height: width / 20, width: width / 15}}>
            <Text style={{fontSize: 10}}>{moment().month(containsFirstOfMonth).format('MMM')}</Text>
          </View>
        )
        containsFirstOfMonth = null
      } else {
        days[0] = <View key={`${i}top`} style={{marginTop: width / 20}}>{days[0]}</View>
      }
      weeks.push(<WeekColumn key={i} days={days}/>)
    }
    return weeks
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Ride History</Text>
          </View>
        </CardItem>
        <CardItem>
          <ScrollView horizontal={true} ref={x => this.squaresContainer = x}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
              { this.generateSquares() }
            </View>
          </ScrollView>
        </CardItem>
      </Card>
    )
  }
}
