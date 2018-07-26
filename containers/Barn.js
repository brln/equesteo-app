import React, { Component } from 'react'
import { connect } from 'react-redux';

import Barn from '../components/Barn'
import NavigatorComponent from './NavigatorComponent'
import { FEED, HORSE_PROFILE } from '../screens'

class BarnContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.horseProfile = this.horseProfile.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
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

  yourHorses () {
    return this.props.horses.toList().filter((h) => {
      return (h.get('userID') === this.props.userID) && h.get('deleted') !== true
    })
  }

  render() {
    console.log('rendering BarnContainer')
    return (
      <Barn
        horses={this.yourHorses()}
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
    horses: mainState.get('horses'),
    userID: localState.get('userID'),
    user: state.getIn(['users', localState.get('userID')])
  }
}

export default  connect(mapStateToProps)(BarnContainer)
