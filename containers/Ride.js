import React, { Component } from 'react'
import { connect } from 'react-redux';

import Ride from '../components/Ride'


class RideContainer extends Component {
  constructor (props) {
    super(props)
    this.deleteRide = this.deleteRide.bind(this)
  }

  deleteRide () {
    this.props.dispatch(updateRide({
      ...this.props.ride,
      deleted: true,
    }))
  }

  render() {
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
  return {
    horses: state.horses,
    ride: state.rides.filter((r) => r._id === passedProps.rideID)[0],
  }
}

export default  connect(mapStateToProps)(RideContainer)
