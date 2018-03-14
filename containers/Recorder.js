import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { startRide } from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'

class RecorderContainer extends Component {
  constructor (props) {
    super(props)
    this.startRide = this.startRide.bind(this)
  }

  startRide () {
    this.props.dispatch(startRide())
  }

  render() {
    return (
      <RideRecorder
        currentRide={this.props.currentRide}
        horses={this.props.horses}
        lastLocation={this.props.lastLocation}
        startRide={this.startRide}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    currentRide: state.currentRide,
    horses: state.horses,
    lastLocation: state.lastLocation,

  }
}

export default  connect(mapStateToProps)(RecorderContainer)
