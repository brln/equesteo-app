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

  horseProfile (horse, ownerID) {
    const rightButtons = [
      {
        title: "Archive",
        id: 'archive',
      }
    ]
    if (ownerID === this.props.userID) {
      rightButtons.push({
        title: "Edit",
        id: 'edit'
      })
    }
    this.props.navigator.push({
      screen: HORSE_PROFILE,
      title: horse.get('name'),
      passProps: { horse },
      navigatorButtons: {
        leftButtons: [],
        rightButtons,
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

  horseOwnerIDs () {
    return this.props.horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  render() {
    logRender('BarnContainer')
    return (
      <Barn
        horses={this.yourHorses()}
        horseProfile={this.horseProfile}
        horseOwnerIDs={this.horseOwnerIDs()}
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
