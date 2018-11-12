import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import URI from 'urijs'
import {
  Dimensions,
  Linking,
  ScrollView,
  StatusBar,
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
  setAwaitingPasswordChange,
  submitLogin,
  submitSignup
} from '../actions'
import BuildImage from '../components/BuildImage'
import ForgotPage from '../components/SignupLogin/ForgotPage'
import SignupPage from '../components/SignupLogin/SignupPage'
import LoginPage from '../components/SignupLogin/LoginPage'
import { logRender } from '../helpers'

const { width, height } = Dimensions.get('window')

class SignupLoginContainer extends PureComponent {
  static options() {
    return {
      layout: {
        orientation: ['portrait']
      }
    }
  }

  static navigatorStyle = {
    navBarHidden: true
  }

  constructor (props) {
    super(props)
    this.state = {
      signup: false,
      forgot: false,
      forgotSubmitted: false,
      resetCodeSubmitted: false,
    }
    this.errorOccurred = this.errorOccurred.bind(this)
    this.exchangePWCode = this.exchangePWCode.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this.handleURL = this.handleURL.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
    this.showForgot = this.showForgot.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.showSignup = this.showSignup.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.newPassword = this.newPassword.bind(this)
  }

  componentDidUpdate (nextProps) {
    if (this.props.error) {
      setTimeout(() => {
        this.props.dispatch(dismissError())
      }, 3000)
    }
  }


  static getDerivedStateFromProps (props, state) {
    let nextState = {...state}
    if (props.error) {
      nextState.forgotSubmitted = false
      nextState.resetCodeSubmitted = false
    }
    return nextState
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleURL)
  }

  componentWillUnmount () {
    Linking.removeEventListener('url', this.handleURL)
  }

  handleURL ({ url }) {
    const parsedURL = URI(url)
    const token = parsedURL.search(true).t
    const email = atob(parsedURL.search(true).e)
    if (email && token) {
      this.setState({
        forgot: true,
        forgotSubmitted: true,
      })
      this.exchangePWCode(email, token)
    }
  }

  errorOccurred (errorText) {
    this.props.dispatch(errorOccurred(errorText))
  }

  newPassword (password) {
    this.props.dispatch(newPassword(password))
    this.props.dispatch(setAwaitingPasswordChange(false))
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
    this.props.dispatch(dismissError())
    this.props.dispatch(exchangePWCode(email, code))
    this.setState({
      resetCodeSubmitted: true
    })
  }

  showSignup () {
    this.props.dispatch(dismissError())
    this.setState({
      signup: true,
      forgot: false,
      forgotSubmitted: false
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
      forgot: false,
      forgotSubmitted: false
    })
  }

  render() {
    logRender('SignupLoginContainer')
    let form = (
      <LoginPage
        doingInitialLoad={this.props.doingInitialLoad}
        submitLogin={this.submitLogin}
        showSignup={this.showSignup}
        showForgot={this.showForgot}
      />
    )
    if (this.state.signup) {
      form = (
        <SignupPage
          doingInitialLoad={this.props.doingInitialLoad}
          submitSignup={this.submitSignup}
          showLogin={this.showLogin}
        />
      )
    } else if (this.state.forgot) {
      form = (
        <ForgotPage
          awaitingPWChange={this.props.awaitingPWChange}
          error={this.props.error}
          errorOccurred={this.errorOccurred}
          exchangePWCode={this.exchangePWCode}
          forgotSubmitted={this.state.forgotSubmitted}
          newPassword={this.newPassword}
          showSignup={this.showSignup}
          showLogin={this.showLogin}
          getPWCode={this.getPWCode}
          resetCodeSubmitted={this.state.resetCodeSubmitted}
        />
      )
    }
    const error = this.props.error ? <Text style={styles.errorBox}>{this.props.error}</Text> : null
    return (
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps={'always'}
          >
            <View style={{height: height - StatusBar.currentHeight}}>
              {error}
              <BuildImage
                source={require('../img/loginbg3.jpg')}
                style={{ width, height, resizeMode: 'stretch' }}
              />
              {form}
            </View>
          </ScrollView>
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
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'red',
  }
});

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    awaitingPWChange: localState.get('awaitingPWChange'),
    doingInitialLoad: localState.get('doingInitialLoad'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(SignupLoginContainer)
