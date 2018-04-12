import React, { Component } from 'react'
import { connect } from 'react-redux'


import {
  changeScreen,
  discardRide,
  stopLocationTracking,
  startRide,
  startLocationTracking
} from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { FEED } from '../screens'

class RecorderContainer extends Component {
  constructor (props) {
    super(props)
    this.discardRide = this.discardRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  componentDidMount () {
    this.props.dispatch(startLocationTracking())
  }

  componentWillUnmount () {
    if (!this.props.currentRide) {
      this.props.dispatch(stopLocationTracking())
    }
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
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    appState: state.appState,
    currentRide: state.currentRide,
    horses: state.horses,
    lastLocation: state.lastLocation,
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
