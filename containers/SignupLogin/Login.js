import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import PageWrapper from '../../components/SignupLogin/PageWrapper'
import Button from '../../components/Button'
import { brand } from '../../colors'
import Loader from '../../components/SignupLogin/Loader'
import LoginForm from '../../components/SignupLogin/LoginForm'
import {
  dismissError,
  setForgotEmail,
} from '../../actions/standard'
import { submitLogin } from '../../actions/functional'
import Amplitude, {
  SIGN_IN,
} from "../../services/Amplitude"
import EqNavigation from '../../services/EqNavigation'
import { SIGNUP, FORGOT } from '../../screens/consts/main'
import SignupContainerParent  from './SignupContainerParent'

const { height } = Dimensions.get('window')

class LoginContainer extends SignupContainerParent  {
  constructor (props) {
    super(props)
    this.state = {
      cursor: 0,
      email: null,
      password: null,
      passwordVisible: false,
      reqSubmitted: false
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this._renderLoginForm = this._renderLoginForm.bind(this)
    this.showForgot = this.showForgot.bind(this)
    this.showSignup = this.showSignup.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.togglePasswordVisible = this.togglePasswordVisible.bind(this)
  }

  togglePasswordVisible () {
    this.setState({
      passwordVisible: !this.state.passwordVisible
    })
    this.inputs.password.blur()
  }

  changeEmail (text) {
    this.setState({
      email: text
    })
    this.props.dispatch(setForgotEmail(text))
  }

  changePassword (text) {
    this.setState({
      password: text
    })
  }


  moveToPassword (e) {
    this.inputs['password'].focus()
  }

  submitLogin () {
    if (this.state.email && this.state.password) {
      this.setState({
        reqSubmitted: true,
      }, () => {
        Amplitude.logEvent(SIGN_IN)
        this.props.dispatch(submitLogin(this.state.email, this.state.password)).then(() => {
          this.setState({
            reqSubmitted: false,
          })
        })
      })
    }
  }

  showSignup () {
    this.props.dispatch(dismissError())
    EqNavigation.push(this.props.componentId, {
      component: {
        name: SIGNUP,
      }
    }).catch(e => { console.log(e) })
  }

  showForgot () {
    this.props.dispatch(dismissError())
    EqNavigation.push(this.props.componentId, {
      component: {
        name: FORGOT,
      }
    }).catch(e => { console.log(e) })
  }

  _renderLoginForm () {
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    let button = <ActivityIndicator color={brand}/>
    if (!this.state.reqSubmitted) {
      button = <Button text={'Submit'} color={brand} onPress={this.submitLogin}/>
    }
    return (
      <View>
        <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
          <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Log In</Text>
        </View>
        <LoginForm
          changeEmail={this.changeEmail}
          changePassword={this.changePassword}
          cursor={this.state.cursor}
          inputs={this.inputs}
          moveToPassword={this.moveToPassword}
          passwordVisible={this.state.passwordVisible}
          submitLogin={this.submitLogin}
          togglePasswordVisible={this.togglePasswordVisible}
        />
        <View>
          { button }
          <View style={{flex: 1, marginTop: 20}}>
            <TouchableOpacity style={styles.forgotButton} onPress={this.showForgot}>
              <View>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Forgot Your Password?</Text></Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton} onPress={this.showSignup}>
              <View style={styles.switchup} >
                <Text style={[styles.underlineText, styles.switchupText]}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          { this.props.doingInitialLoad ?
              <Loader
                paddingTop={height / 3}
                paddingBottom={20}
                docsToDownload={this.props.docsToDownload}
                docsDownloaded={this.props.docsDownloaded}
              />
            : this._renderLoginForm()
          }
        </View>
      </PageWrapper>
    )
  }
}

const styles = StyleSheet.create({
  signupButton: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  forgotButton: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  container: {
    position: 'absolute',
    width: "100%",
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  switchupText: {
    textAlign: 'center',
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
})

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    doingInitialLoad: localState.get('doingInitialLoad'),
    docsToDownload: localState.get('docsToDownload'),
    docsDownloaded: localState.get('docsDownloaded'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(LoginContainer)

