import React, { Component } from 'react'
import { connect } from 'react-redux';

import Barn from '../components/Barn/Barn'
import { logRender } from '../helpers'
import NavigatorComponent from './NavigatorComponent'
import { HORSE_PROFILE } from '../screens'

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
            title: "Edit",
            id: 'edit',
          },
          {
            title: "Delete",
            id: 'delete',
          }
        ]
      },
    })
  }

  yourHorses () {
    return this.props.horses.valueSeq().filter((h) => {
      return (h.get('userID') === this.props.userID) && h.get('deleted') !== true
    }).toList()
  }

  render() {
    logRender('BarnContainer')
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
