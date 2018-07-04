import React, { Component } from 'react'
import { connect } from 'react-redux';
import URI from 'urijs'
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  dismissError,
  errorOccurred,
  exchangePWCode,
  getPWCode,
  newPassword,
  submitLogin,
  submitSignup
} from '../actions'
import ForgotForm from '../components/SignupLogin/ForgotForm'
import SignupForm from '../components/SignupLogin/SignupForm'
import LoginForm from '../components/SignupLogin/LoginForm'

class SignupLoginContainer extends Component {
  static navigatorStyle = {
    navBarHidden: true
  }

  constructor (props) {
    super(props)
    this.state = {
      signup: false,
      forgot: false,
      forgotSubmitted: false
    }
    this.errorOccurred = this.errorOccurred.bind(this)
    this.exchangePWCode = this.exchangePWCode.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
    this.showForgot = this.showForgot.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.showSignup = this.showSignup.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.newPassword = this.newPassword.bind(this)
  }


  static getDerivedStateFromProps (props, state) {
    let nextState = {...state}
    if (props.error) {
      nextState.forgotSubmitted = null
    }
    return nextState
  }

  componentDidMount() {
    Linking.addEventListener('url', ({ url }) => {
      const parsedURL = URI(url)
      const token = parsedURL.search(true).token
      console.log(token)
    });
  }

  errorOccurred (errorText) {
    this.props.dispatch(errorOccurred(errorText))
  }

  newPassword (password) {
    this.props.dispatch(newPassword(password))
  }

  submitSignup (email, password) {
    this.props.dispatch(submitSignup(email, password))
  }

  submitLogin (email, password) {
    this.props.dispatch(submitLogin(email, password))
  }

  async getPWCode (email) {
    this.setState({ forgotSubmitted: true })
    this.props.dispatch(getPWCode(email))
  }

  exchangePWCode (email, code) {
    this.props.dispatch(exchangePWCode(email, code))
  }

  showSignup () {
    this.props.dispatch(dismissError())
    this.setState({
      signup: true,
      forgot: false
    })
  }

  showForgot () {
    this.props.dispatch(dismissError())
    this.setState({
      signup: false,
      forgot: true
    })
  }

  showLogin () {
    this.props.dispatch(dismissError())
    this.setState({
      signup: false,
      forgot: false
    })
  }

  render() {
    let form = (
      <LoginForm
        doingInitialLoad={this.props.doingInitialLoad}
        submitLogin={this.submitLogin}
        showSignup={this.showSignup}
        showForgot={this.showForgot}
      />
    )
    if (this.state.signup) {
      form = (
        <SignupForm
          submitSignup={this.submitSignup}
          showLogin={this.showLogin}
        />
      )
    } else if (this.state.forgot) {
      form = (
        <ForgotForm
          awaitingPWChange={this.props.awaitingPWChange}
          error={this.props.error}
          errorOccurred={this.errorOccurred}
          exchangePWCode={this.exchangePWCode}
          forgotSubmitted={this.state.forgotSubmitted}
          newPassword={this.newPassword}
          showSignup={this.showSignup}
          showLogin={this.showLogin}
          getPWCode={this.getPWCode}
          resetCodeAccepted={this.props.resetCodeAccepted}
        />
      )
    }
    const error = this.props.error ? <Text style={styles.errorBox}>{this.props.error}</Text> : null
    return (
        <View style={styles.container}>
          {error}
          <Image
            source={require('../img/loginbg3.jpg')}
            style={{width: "100%", height: "100%"}}
          />
          {form}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  errorBox: {
    marginTop: 40,
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'red',
  }
});

function mapStateToProps (state) {
  return {
    awaitingPWChange: state.localState.awaitingPWChange,
    doingInitialLoad: state.localState.doingInitialLoad,
    error: state.localState.error,
    resetCodeAccepted: state.localState.resetCodeAccepted
  }
}

export default connect(mapStateToProps)(SignupLoginContainer)
