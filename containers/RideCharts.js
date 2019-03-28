import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'

import { brand } from '../colors'
import RideCharts from '../components/RideCharts/RideCharts'
import { EqNavigation } from '../services'

class RideChartsContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
        background: {
          color: brand,
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'back') {
      EqNavigation.pop(this.props.componentId)
    }
    Keyboard.dismiss()
  }

  render() {
    return (
      <RideCharts
        ride={this.props.ride}
        rideCoordinates={this.props.rideCoordinates}
        rideElevations={this.props.rideElevations}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const ride = pouchState.getIn(['rides', passedProps.rideID])
  const rideCoordinates = pouchState.getIn(['selectedRideCoordinates'])
  const rideElevations = pouchState.getIn(['selectedRideElevations'])
  return {
    ride,
    rideCoordinates,
    rideElevations,
  }
}

export default  connect(mapStateToProps)(RideChartsContainer)
