import React, { Component } from 'react'
import { connect } from 'react-redux';

import Ride from '../components/Ride/Ride'
import { updateRide } from '../actions'
import NavigatorComponent from './NavigatorComponent'

class RideContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.deleteRide = this.deleteRide.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.ride.get('name') !== this.props.ride.get('name')) {
      this.props.navigator.setTitle({title: nextProps.ride.get('name')})
    }
  }

  deleteRide () {
    this.props.dispatch(updateRide(this.props.ride.set('deleted', true)))
  }

  render() {
    console.log('rendering RideContainer')
    return (
      <Ride
        deleteRide={this.deleteRide}
        horses={this.props.horses}
        navigator={this.props.navigator}
        ride={this.props.ride}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  return {
    horses: mainState.get('horses').toList(),
    ride: mainState.getIn(['rides', passedProps.rideID])
  }
}

export default  connect(mapStateToProps)(RideContainer)
