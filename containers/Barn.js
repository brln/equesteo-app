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
      passProps: { horse },
      navigatorButtons: {
        leftButtons: [],
        rightButtons: [
          {
            title: "Edit",
            id: 'edit',
          },
          {
            title: "Archive",
            id: 'archive',
          }
        ]
      },
    })
  }

  yourHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
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
    horseUsers: mainState.get('horseUsers'),
    horses: mainState.get('horses'),
    userID: localState.get('userID'),
    user: state.getIn(['users', localState.get('userID')])
  }
}

export default  connect(mapStateToProps)(BarnContainer)
