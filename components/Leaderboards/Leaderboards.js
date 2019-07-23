import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { brand, darkBrand } from '../../colors'
import Button from '../Button'
import LeaderList from './LeaderList'

import {
  TIME_WEEK,
  TIME_MONTH,
  TIME_YEAR,
  STAT_DISTANCE,
  STAT_TIME,
  STAT_ASCENT,
} from './consts'

export default class Leaderboards extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedTime: TIME_WEEK,
      selectedStat: STAT_DISTANCE
    }

    this.changeTime = this.changeTime.bind(this)
    this.changeStat = this.changeStat.bind(this)
    this.selectedDataset = this.selectedDataset.bind(this)
  }

  changeTime (selectedTime) {
    return () => {
      this.setState({ selectedTime })
    }
  }

  changeStat (selectedStat) {
    return () => {
      this.setState({ selectedStat })
    }
  }

  selectedDataset () {
    return this.props.leaderboards.getIn([this.state.selectedTime, this.state.selectedStat])
  }

  render() {
    if (this.props.loading) {
      return (
        <View style={{paddingTop: 50}}>
          <ActivityIndicator size="large" color={darkBrand} />
          <Text style={{textAlign: 'center', color: darkBrand}}>Loading Data...</Text>
        </View>
      )
    } else {
      return (
        <ScrollView>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 20,
            paddingRight: 20,
          }}>
            <Button
              color={this.state.selectedTime === TIME_WEEK ? brand : darkBrand}
              text={'Week'}
              onPress={this.changeTime(TIME_WEEK)}
            />
            <Button
              color={this.state.selectedTime === TIME_MONTH ? brand : darkBrand}
              text='Month'
              onPress={this.changeTime(TIME_MONTH)}
            />
            <Button
              color={this.state.selectedTime === TIME_YEAR ? brand : darkBrand}
              text='Year'
              onPress={this.changeTime(TIME_YEAR)}
            />
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 10,
          }}>
            <Button
              color={this.state.selectedStat === STAT_DISTANCE ? brand : darkBrand}
              text={'Distance'}
              onPress={this.changeStat(STAT_DISTANCE)}
            />
            <Button
              color={this.state.selectedStat === STAT_TIME ? brand : darkBrand}
              text='Time'
              onPress={this.changeStat(STAT_TIME)}
            />
            <Button
              color={this.state.selectedStat === STAT_ASCENT ? brand : darkBrand}
              text='Ascent'
              onPress={this.changeStat(STAT_ASCENT)}
            />
          </View>

          <LeaderList
            dataset={this.selectedDataset()}
            horsePhotos={this.props.horsePhotos}
            horses={this.props.horses}
            horseOwnerIDs={this.props.horseOwnerIDs}
            selectedStat={this.state.selectedStat}
            showHorseProfile={this.props.showHorseProfile}
            showProfile={this.props.showProfile}
            userPhotos={this.props.userPhotos}
            users={this.props.users}
          />

        </ScrollView>
      )
    }
  }
}
