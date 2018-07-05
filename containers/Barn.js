import React, { Component } from 'react'
import { connect } from 'react-redux';

import { changeScreen, createHorse } from '../actions'
import Barn from '../components/Barn'
import NavigatorComponent from './NavigatorComponent'
import { FEED, HORSE_PROFILE } from '../screens'

class BarnContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.saveNewHorse = this.saveNewHorse.bind(this)
    this.horseProfile = this.horseProfile.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent (event) {
    if (event.id === 'willDisappear' && event.type === 'ScreenChangedEvent') {
      this.props.dispatch(changeScreen(FEED))
    }
  }

  horseProfile (horse) {
    this.props.navigator.push({
      screen: HORSE_PROFILE,
      title: horse.name,
      passProps: {horse: horse, user: this.props.user},
      navigatorButtons: {
        leftButtons: [],
        rightButtons: [
          {
            icon: require('../img/threedot.png'),
            id: 'dropdown',
          }
        ]
      },
    })
  }

  saveNewHorse (horseData) {
    this.props.dispatch(createHorse({
      ...horseData,
      _id:  `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
      userID: this.props.userID
    }))
  }

  render() {
    return (
      <Barn
        horses={this.props.horses}
        horseProfile={this.horseProfile}
        saveNewHorse={this.saveNewHorse}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    horses: state.horses.filter((h) => h.userID === state.localState.userID && h.deleted !== true),
    userID: state.localState.userID,
    user: state.users[state.localState.userID]
  }
}

export default  connect(mapStateToProps)(BarnContainer)
