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
        rideCoords={this.props.ride.get('rideCoordinates').toJS()}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    ride: state.getIn(['main', 'rides', passedProps.rideID])
  }
}

export default  connect(mapStateToProps)(MapContainer)
