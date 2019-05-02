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

import { RELEASE } from '../dotEnv'
import {
  dismissError,
  errorOccurred,
  setAwaitingPasswordChange,
} from '../actions/standard'
import {
  exchangePWCode,
  getPWCode,
  newPassword,
  submitLogin,
  submitSignup
} from '../actions/functional'
import BuildImage from '../components/Images/BuildImage'
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
      login: false,
      forgot: false,
      forgotSubmitted: false,
      resetCodeSubmitted: false,
      reqSubmitted: false,
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
    this.setState({
      reqSubmitted: true,
    }, () => {
      this.props.dispatch(submitSignup(email, password)).then(() => {
        this.setState({
          reqSubmitted: false,
        })
      })
    })
  }

  submitLogin (email, password) {
    this.setState({
      reqSubmitted: true,
    }, () => {
      this.props.dispatch(submitLogin(email, password)).then(() => {
        this.setState({
          reqSubmitted: false,
        })
      })
    })
  }

  getPWCode (email) {
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
      login: false,
      forgot: false,
      forgotSubmitted: false
    })
  }

  showForgot () {
    this.props.dispatch(dismissError())
    this.setState({
      login: false,
      forgot: true
    })
  }

  showLogin () {
    this.props.dispatch(dismissError())
    this.setState({
      login: true,
      forgot: false,
      forgotSubmitted: false
    })
  }

  render() {
    logRender('SignupLoginContainer')
    let form = (
      <SignupPage
        doingInitialLoad={this.props.doingInitialLoad}
        docsToDownload={this.props.docsToDownload}
        docsDownloaded={this.props.docsDownloaded}
        errorOccurred={this.errorOccurred}
        reqSubmitted={this.state.reqSubmitted}
        submitSignup={this.submitSignup}
        showLogin={this.showLogin}
      />
    )
    if (this.state.login) {
      form = (
        <LoginPage
          docsToDownload={this.props.docsToDownload}
          docsDownloaded={this.props.docsDownloaded}
          doingInitialLoad={this.props.doingInitialLoad}
          reqSubmitted={this.state.reqSubmitted}
          submitLogin={this.submitLogin}
          showSignup={this.showSignup}
          showForgot={this.showForgot}
        />
      )
    } else if (this.state.forgot) {
      form = (
        <ForgotPage
          awaitingPWChange={this.props.awaitingPWChange}
          doingInitialLoad={this.props.doingInitialLoad}
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
              <BuildImage
                source={require('../img/loginbg4.jpg')}
                style={{ width, height, resizeMode: 'cover' }}
              />
              {form}
              {error}
            </View>
          </ScrollView>
          <View style={{position: 'absolute', bottom: 5, left: 5, width}}>
            <Text style={{color: '#b8b8b8', fontSize: 8}}>Version { RELEASE.split('-')[1] }</Text>
          </View>
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
    position: 'absolute',
    top: 0,
    width
  }
});

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    awaitingPWChange: localState.get('awaitingPWChange'),
    doingInitialLoad: localState.get('doingInitialLoad'),
    docsToDownload: localState.get('docsToDownload'),
    docsDownloaded: localState.get('docsDownloaded'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(SignupLoginContainer)
