import React, { Component } from 'react'
import { connect } from 'react-redux';

import Ride from '../components/Ride/Ride'
import { updateRide } from '../actions'
import { logRender } from '../helpers'
import NavigatorComponent from './NavigatorComponent'

class RideContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.deleteRide = this.deleteRide.bind(this)
    this.horses = this.horses.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.ride.get('name') !== this.props.ride.get('name')) {
      this.props.navigator.setTitle({title: nextProps.ride.get('name')})
    }
  }

  deleteRide () {
    this.props.dispatch(updateRide(this.props.ride.set('deleted', true)))
  }

  horses () {
    return this.props.horses.toList()
  }

  rideHorseOwnerID () {
    let rideHorseOwnerID
    this.props.horseUsers.forEach(hu => {
      if (hu.get('owner') === true && hu.get('horseID') === this.props.ride.get('horseID')) {
        rideHorseOwnerID = hu.get('userID')
      }
    })
    if (!rideHorseOwnerID) {
      throw Error('Could not find rideHorseOwnerID')
    }
    return rideHorseOwnerID
  }

  render() {
    logRender('RideContainer')
    return (
      <Ride
        deleteRide={this.deleteRide}
        horses={this.horses()}
        navigator={this.props.navigator}
        ride={this.props.ride}
        rideHorseOwnerID={this.rideHorseOwnerID()}
        rideUser={this.props.rideUser}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const ride = mainState.getIn(['rides', passedProps.rideID])
  const userID = localState.get('userID')
  return {
    horses: mainState.get('horses'),
    horseUsers: mainState.get('horseUsers'),
    ride,
    rideUser: mainState.getIn(['users', ride.get('userID')]),
    userID
  }
}

export default  connect(mapStateToProps)(RideContainer)
