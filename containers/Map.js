import React, { Component } from 'react'
import { connect } from 'react-redux';

import Map from '../components/Ride/Map'
import NavigatorComponent from './NavigatorComponent'

class MapContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <Map
        rideCoords={this.props.ride.rideCoordinates}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    ride: state.rides.filter((r) => r._id === passedProps.rideID)[0],
  }
}

export default  connect(mapStateToProps)(MapContainer)
