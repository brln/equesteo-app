import { List, Map } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import Training from '../components/Training/Training'
import { logRender } from '../helpers'
import { RIDE } from '../screens'

class TrainingContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Training",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        }
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.allRidersButYou = this.allRidersButYou.bind(this)
    this.allRidesOnYourHorses = this.allRidesOnYourHorses.bind(this)
    this.rideHorses = this.rideHorses.bind(this)
    this.showRide = this.showRide.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
  }

  showRide (ride) {
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        passProps: {rideID: ride.get('_id')}
      }
    });
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
    const horseIDsByRideID = this.props.rideHorses.reduce((accum, rh) => {
      if (!accum.get(rh.get('rideID'))) {
        accum = accum.set(rh.get('rideID'), List())
      }
      const horseIDs = accum.get(rh.get('rideID')).push(rh.get('horseID'))
      return accum.set(rh.get('rideID'), horseIDs)
    }, Map())
    return this.props.rides.valueSeq().filter((ride) => {
      const thisRidesHorseIDs = horseIDsByRideID.get(ride.get('_id'))
      let includesHorse = yourHorseIDs.indexOf(ride.get('horseID')) >= 0 // so we show old rides with horseID
      if (thisRidesHorseIDs && thisRidesHorseIDs.count() > 0) {
        thisRidesHorseIDs.map(horseID => {
          if (yourHorseIDs.indexOf(horseID) >= 0) {
            includesHorse = true
          }
        })
      }
      return (
        includesHorse
          || (ride.get('userID') === this.props.userID && !ride.get('horseID'))
        ) && ride.get('deleted') !== true
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

  rideHorses () {
    return this.props.rideHorses.filter(rh => {
      return rh.get('deleted') !== true
    })
  }

  render() {
    logRender('TrainingContainer')
    return (
      <Training
        horses={this.props.horses}
        horseUsers={this.props.horseUsers}
        rideHorses={this.rideHorses()}
        rides={this.allRidesOnYourHorses()}
        riders={this.allRidersButYou()}
        showRide={this.showRide}
        user={this.props.user}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')
  return {
    horses: pouchState.get('horses'),
    horseUsers: pouchState.get('horseUsers'),
    rides: pouchState.get('rides'),
    rideHorses: pouchState.get('rideHorses'),
    user: pouchState.getIn(['users', userID]),
    users: pouchState.get('users'),
    userID,
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
