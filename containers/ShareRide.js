import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { Keyboard, Text } from 'react-native'
import { connect } from 'react-redux';

import { brand } from '../colors'
import { logRender } from '../helpers'

class ShareRideContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        title: {
          color: 'white',
          fontSize: 20,
          text: 'Share Ride'
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'back') {
      Keyboard.dismiss()
      Navigation.pop(this.props.componentId)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
    }

    Navigation.events().bindComponent(this);
  }


  render() {
    logRender('ShareRide Container')
    return (
      <Text>Boom</Text>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const ride = pouchState.getIn(['rides', passedProps.rideID])
  const rideCoordinates = pouchState.get('selectedRideCoordinates')
  const rideElevations = pouchState.get('selectedRideElevations')
  return {
    ride,
    rideCarrots: pouchState.get('rideCarrots'),
    rideCoordinates,
    rideElevations,
  }
}

export default connect(mapStateToProps)(ShareRideContainer)
