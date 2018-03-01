import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { saveRide } from '../actions'
import PositionRecorder from '../components/PositionRecorder'


class RecorderContainer extends Component {
  constructor (props) {
    super(props)
    this.saveRide = this.saveRide.bind(this)
  }

  async saveRide (rideData) {
    this.props.dispatch(
      saveRide(
        this.props.jwtToken,
        rideData
      )
    )
  }

  render() {
    return (
      <PositionRecorder
        saveRide={this.saveRide}
      />
    )
  }
}

function mapStateToProps (state) {
  return state
}

export default  connect(mapStateToProps)(RecorderContainer)
