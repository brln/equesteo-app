import { Map } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux';

import Training from '../components/Training/Training'
import NavigatorComponent from './NavigatorComponent'
import { logRender } from '../helpers'

class TrainingContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.allRidersButYou = this.allRidersButYou.bind(this)
    this.allRidesOnYourHorses = this.allRidesOnYourHorses.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
  }

  yourHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID)
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  allRidesOnYourHorses () {
    const yourHorseIDs = this.yourHorses().valueSeq().map(h => h.get('_id'))
    return this.props.rides.valueSeq().filter((ride) => {
      return yourHorseIDs.indexOf(ride.get('horseID')) >= 0 && ride.get('deleted') !== true
    })
  }

  allRidersButYou () {
    const ridesOnYourHorses = this.allRidesOnYourHorses()
    let peopleWhoRideYourHorses = Map()
    ridesOnYourHorses.forEach(ride => {
      if (ride.get('userID') !== this.props.userID) {
        peopleWhoRideYourHorses = peopleWhoRideYourHorses.set(
          ride.get('userID'),
          this.props.users.get(ride.get('userID'))
        )
      }
    })
    return peopleWhoRideYourHorses
  }


  render() {
    logRender('SignupLoginContainer')
    return (
      <Training
        horses={this.yourHorses()}
        navigator={this.props.navigator}
        rides={this.allRidesOnYourHorses()}
        riders={this.allRidersButYou()}
        user={this.props.user}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  return {
    horses: mainState.get('horses'),
    horseUsers: mainState.get('horseUsers'),
    rides: mainState.get('rides'),
    user: mainState.getIn(['users', userID]),
    users: mainState.get('users'),
    userID,
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
