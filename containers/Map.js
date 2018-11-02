import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import Map from '../components/Ride/Map'
import { logRender } from '../helpers'

class MapContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
  }

  render() {
    logRender('MapContainer')
    return (
      <Map
        rideCoordinates={this.props.rideCoordinates}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const rideCoordinates = state.getIn([
    'pouchRecords',
    'selectedRideCoordinates',
    'rideCoordinates'
  ])
  return {
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    rideCoordinates,
  }
}

export default  connect(mapStateToProps)(MapContainer)
