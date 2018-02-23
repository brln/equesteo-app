import React, { Component } from 'react'
import { API_URL } from 'react-native-dotenv'

import SignupSignin from '../components/SignupSignin'
import PositionRecorder from '../components/PositionRecorder'
import RideAPI from '../services/ride_api'
import UserAPI from '../services/user_api'
import {BadRequestError, UnauthorizedError} from "../errors"


export default class MainContainer extends Component {
  constructor (props) {
    super(props)
    // @TODO: Figure out how to persist this.
    this.state = {
      jwtToken: null,
      error: null,
    }
    this.saveRide = this.saveRide.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
  }

  async submitSignup (email, password) {
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.signup(email, password)
      this.setState({
        jwtToken: resp.token
      })
    } catch (e) {
      console.log(e)
      if (e instanceof BadRequestError) {
        console.log(e)
        this.setState({
          error: e.message
        })
      }
    }
  }

  async submitLogin (email, password) {
    // @TODO: Handle not connected to network
    const userAPI = new UserAPI()
    try {
      const resp = await userAPI.login(email, password)
      this.setState({
        jwtToken: resp.token
      })
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        this.setState({
          error: e.message
        })
      }
    }

  }

  async saveRide (positions) {
    const rideAPI = new RideAPI(this.state.jwtToken)
    try {
      const resp = await rideAPI.saveRide({positions: positions})
    } catch (e) {
      console.log(e)
      debugger
    }

  }

  render() {
    if (this.state.jwtToken) {
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
