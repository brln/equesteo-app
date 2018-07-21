import React, { Component } from 'react'
import { connect } from 'react-redux';

import { changeScreen, createHorse } from '../actions'
import Barn from '../components/Barn'
import NavigatorComponent from './NavigatorComponent'
import { FEED, HORSE_PROFILE } from '../screens'

class BarnContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
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

  render() {
    return (
      <Barn
        horses={this.props.horses}
        horseProfile={this.horseProfile}
        navigator={this.props.navigator}
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
