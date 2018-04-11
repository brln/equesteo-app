import React, { Component } from 'react'
import { connect } from 'react-redux'


import { stopLocationTracking, startRide, startLocationTracking } from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'

class RecorderContainer extends Component {
  constructor (props) {
    super(props)
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
    this.props.dispatch(startRide())
  }

  render() {
    return (
      <RideRecorder
        appState={this.props.appState}
        currentRide={this.props.currentRide}
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
