import React, { Component } from 'react'
import { connect } from 'react-redux';

import Map from '../components/Ride/Map'
import NavigatorComponent from './NavigatorComponent'

class MapContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
  }

  render() {
    console.log('rendering MapContainer')
    return (
      <Map
        rideCoords={this.props.ride.get('rideCoordinates')}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    ride: state.getIn(['main', 'rides']).filter(r => r.get('_id') === passedProps.rideID).get(0)
  }
}

export default  connect(mapStateToProps)(MapContainer)
