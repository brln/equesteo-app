import React, { Component } from 'react'
import { connect } from 'react-redux'

import { brand, white } from '../colors'
import {
  changeScreen,
  discardRide,
  stopLocationTracking,
  startRide,
  startLocationTracking
} from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { FEED } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class RecorderContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.discardRide = this.discardRide.bind(this)
    this.startRide = this.startRide.bind(this)
    this.stopLocationTracking = this.stopLocationTracking.bind(this)
  }

  componentDidMount () {
    this.props.dispatch(startLocationTracking())
  }

  stopLocationTracking () {
    this.props.dispatch(stopLocationTracking())
  }

  startRide () {
    this.props.dispatch(startRide(this.props.lastLocation))
  }

  discardRide () {
    this.props.dispatch(discardRide())
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(FEED))
  }

  render() {
    return (
      <RideRecorder
        appState={this.props.appState}
        currentRide={this.props.currentRide}
        discardRide={this.discardRide}
        horses={this.props.horses}
        lastLocation={this.props.lastLocation}
        navigator={this.props.navigator}
        startRide={this.startRide}
        stopLocationTracking={this.stopLocationTracking}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    appState: state.localState.appState,
    currentRide: state.localState.currentRide,
    horses: state.horses,
    lastLocation: state.localState.lastLocation,
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
