import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { submitLogin, submitSignup } from '../actions'
import SignupSignin from '../components/SignupSignin'
import PositionRecorder from '../components/PositionRecorder'
import RideAPI from '../services/ride_api'


class MainContainer extends Component {
  constructor (props) {
    super(props)
    // @TODO: Figure out how to persist this.
    this.state = {
      error: null,
    }
    this.saveRide = this.saveRide.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
  }

  async submitSignup (email, password) {
    this.props.dispatch(submitSignup(email, password))
  }

  async submitLogin (email, password) {
    this.props.dispatch(submitLogin(email, password))
  }

  async saveRide (positions) {
    //@Todo: Move this to an action/reducer
    const rideAPI = new RideAPI(this.state.jwtToken)
    try {
      const resp = await rideAPI.saveRide({positions: positions})
    } catch (e) {
      console.log(e)
      debugger
    }

  }

  render() {
    if (this.props.jwtToken) {
      return (
        <PositionRecorder
          saveRide={this.saveRide}
        />
      )
    } else {
      return (
        <SignupSignin
          error={this.state.error}
          submitLogin={this.submitLogin}
          submitSignup={this.submitSignup}
        />
    )}
  }
}

function mapStateToProps (state) {
  return state
}


export default  connect(mapStateToProps)(MainContainer)
