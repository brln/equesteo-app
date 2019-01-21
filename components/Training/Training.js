import moment from 'moment'
import { Container, Tab, Tabs } from 'native-base';
import React, { PureComponent } from 'react'
import {
  View,
} from 'react-native'

import Calendar from './Calendar'
import Charts from './Charts'
import { brand, lightGrey } from '../../colors'
import SettingsModal from './SettingsModal'

export default class Training extends PureComponent {
  constructor (props) {
    super(props)
    this.TYPES = {
      DISTANCE: 'typeDistance',
      TYPE_TIME: 'typeTime',
      TYPE_GAIN: 'typeGain',
      SHOW_ALL_HORSES: 'showAllHorses',
      SHOW_ALL_RIDERS: 'showAllRiders',
      NO_HORSE: 'noHorse'
    }

    this.state = {
      chosenHorseID: this.TYPES.SHOW_ALL_HORSES,
      chosenType: this.TYPES.DISTANCE,
      chosenUserID: this.TYPES.SHOW_ALL_RIDERS,
    }

    this.pickHorse = this.pickHorse.bind(this)
    this.pickRider = this.pickRider.bind(this)
    this.pickType = this.pickType.bind(this)
    this.rideShouldShow = this.rideShouldShow.bind(this)
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

  rideShouldShow (ride, day) {
    const happenedOnDay = moment(ride.get('startTime')).isSame(day, 'day')
    const riderShouldBeShowing = ride.get('userID') === this.state.chosenUserID
      || this.state.chosenUserID === this.TYPES.SHOW_ALL_RIDERS
    const horseShouldBeShowing = ride.get('horseIDs').indexOf(this.state.chosenHorseID) >= 0
      || this.state.chosenHorseID === this.TYPES.SHOW_ALL_HORSES
    return happenedOnDay && riderShouldBeShowing && horseShouldBeShowing
  }

  render() {
    return (
      <Container>
        <SettingsModal
          chosenHorseID={this.state.chosenHorseID}
          chosenType={this.state.chosenType}
          chosenUserID={this.state.chosenUserID}
          closeModal={() => {this.props.settingsModalToggle(false)}}
          horses={this.props.horses}
          horseUsers={this.props.horseUsers}
          modalOpen={this.props.settingsModalOpen}
          pickHorse={this.pickHorse}
          pickRider={this.pickRider}
          pickType={this.pickType}
          riders={this.props.riders}
          types={this.TYPES}
          userID={this.props.userID}
        />
        <Tabs
          initialPage={0}
          locked={true}
          tabBarUnderlineStyle={{backgroundColor: 'white'}}
        >
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            heading="Calendar"
            activeTextStyle={{color: 'white'}}
          >
            <View style={{flex: 1}}>
              <Calendar
                chosenHorseID={this.state.chosenHorseID}
                chosenType={this.state.chosenType}
                chosenUserID={this.state.chosenUserID}
                horses={this.props.horses}
                rideShouldShow={this.rideShouldShow}
                showRide={this.props.showRide}
                types={this.TYPES}
                trainings={this.props.trainings}
                userID={this.props.userID}
              />
            </View>
          </Tab>
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            activeTextStyle={{color: 'white'}}
            heading="Charts"
          >
            <Charts
              chosenHorseID={this.state.chosenHorseID}
              chosenType={this.state.chosenType}
              chosenUserID={this.state.chosenUserID}
              horses={this.props.horses}
              rideShouldShow={this.rideShouldShow}
              trainings={this.props.trainings}
              types={this.TYPES}
            />
          </Tab>
        </Tabs>
      </Container>
    )
  }
}
