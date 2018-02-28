import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { submitLogin, submitSignup } from '../actions'
import SignupSignin from '../components/SignupSignin'

class LoginContainer extends Component {
  constructor (props) {
    super(props)
    // @TODO: Figure out how to persist this.
    this.state = {
      error: null,
    }
    this.submitLogin = this.submitLogin.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
  }

  async submitSignup (email, password) {
    this.props.dispatch(submitSignup(email, password))
  }

  async submitLogin (email, password) {
    this.props.dispatch(submitLogin(email, password))
  }

  render() {
    return (
      <SignupSignin
        error={this.state.error}
        submitLogin={this.submitLogin}
        submitSignup={this.submitSignup}
      />
    )
  }
}

function mapStateToProps (state) {
  return state
}

export default  connect(mapStateToProps)(LoginContainer)
