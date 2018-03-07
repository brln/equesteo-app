import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { discardRide, saveRide, startRide } from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'

class RecorderContainer extends Component {
  constructor (props) {
    super(props)
    this.discardRide = this.discardRide.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.startRide = this.startRide.bind(this)
  }

  discardRide () {
    this.props.dispatch(discardRide())
  }

  saveRide (rideDetails) {
    this.props.dispatch(saveRide(rideDetails))
  }

  startRide () {
    this.props.dispatch(startRide())
  }

  render() {
    return (
      <RideRecorder
        currentRide={this.props.currentRide}
        discardRide={this.discardRide}
        lastLocation={this.props.lastLocation}
        saveRide={this.saveRide}
        startRide={this.startRide}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    lastLocation: state.lastLocation,
    currentRide: state.currentRide
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
