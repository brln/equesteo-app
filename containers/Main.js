import React, { Component } from 'react';
import { API_URL } from 'react-native-dotenv';

import SignupSignin from '../components/SignupSignin';
import PositionRecorder from '../components/PositionRecorder';


export default class MainContainer extends Component {
  constructor (props) {
    super(props)
    // @TODO: Figure out how to persist this.
    this.state = {
      jwtToken: null
    }
    this.saveRide = this.saveRide.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
  }

  submitSignup (email, password) {
    // @TODO: Handle error when user already exists.
    fetch(API_URL + '/users', {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then((response) => { return response.json() })
    .then((response) => { this.setState({ jwtToken: response.token }) })
    .catch((error) => { alert(error) })
  }

  submitLogin (email, password) {
    // @TODO: Handle error when login fails
    // @TODO: Handle not connected to network
    fetch(API_URL + '/users/login', {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then((response) => { return response.json() })
    .then((response) => { this.setState({ jwtToken: response.token }) })
    .catch((error) => { alert(error) })
  }

  saveRide (positions) {
    // @TODO: Make sure you don't lose your ride if there is no network connection
    fetch(API_URL + '/rides', {
      method: "POST",
      body: JSON.stringify({
        positions
      }),
      // @TODO: Move all this request crap into an API service
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer: ' + this.state.jwtToken
      })
    })
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
          submitLogin={this.submitLogin}
          submitSignup={this.submitSignup}
        />
    )}
  }
}
