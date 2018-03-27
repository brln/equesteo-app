import React, { Component } from 'react'
import { connect } from 'react-redux';

import Rides from '../components/Rides'
import { justFinishedRideShown } from "../actions";

class RidesContainer extends Component {
  constructor (props) {
    super(props)
    this.justFinishedRideShown = this.justFinishedRideShown.bind(this)
  }

  justFinishedRideShown () {
    this.props.dispatch(justFinishedRideShown())
  }

  render() {
    return (
      <Rides
        horses={this.props.horses}
        justFinishedRide={this.props.justFinishedRide}
        justFinishedRideShown={this.justFinishedRideShown}
        rides={this.props.rides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    rides: state.rides.filter((ride) => ride.userID === state.userData.id),
    horses: state.horses,
    justFinishedRide: state.justFinishedRide,
  }
}

export default  connect(mapStateToProps)(RidesContainer)
