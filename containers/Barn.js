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
      title: horse.get('name'),
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
    console.log('rendering BarnContainer')
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
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    horses: mainState.get('horses').toList().filter((h) => {
      return (h.get('userID') === localState.get('userID')) && h.get('deleted') !== true
    }),
    userID: localState.get('userID'),
    user: state.getIn(['users', localState.get('userID')])
  }
}

export default  connect(mapStateToProps)(BarnContainer)
