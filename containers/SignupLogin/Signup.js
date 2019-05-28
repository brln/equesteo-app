import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CheckBox } from 'native-base'

import PageWrapper from '../../components/SignupLogin/PageWrapper'
import Loader from '../../components/SignupLogin/Loader'
import Button from '../../components/Button'
import { brand, darkBrand } from '../../colors'
import SignupForm from '../../components/SignupLogin/SignupForm'
import TOSModal from '../../components/SignupLogin/TOSModal'
import {
  dismissError,
  errorOccurred,
} from '../../actions/standard'
import { submitSignup, switchRoot } from '../../actions/functional'
import Amplitude, {
  SIGN_UP,
} from "../../services/Amplitude"
import { LOGIN } from '../../screens/main'
import EqNavigation from '../../services/EqNavigation'
import { logError } from '../../helpers'

const { height, width } = Dimensions.get('window')

class SignupContainer extends PureComponent {
  static options() {
    return {
      layout: {
        orientation: ['portrait']
      },
      topBar: {
        visible: false,
        drawBehind: true,
      }
    }
  }

  static navigatorStyle = {
    navBarHidden: true
  }

  constructor (props) {
    super(props)
    this.state = {
      email: null,
      password1: null,
      password2: null,
      reqSubmitted: false,
      tosAccepted: false,
      showTOS: false,
    }
    this._renderSignupForm = this._renderSignupForm.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.showTOS = this.showTOS.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
    this.toggleTOS = this.toggleTOS.bind(this)
    this.inputs = {}
  }

  componentDidUpdate (nextProps) {
    if (this.props.error) {
      setTimeout(() => {
        this.props.dispatch(dismissError())
      }, 3000)
    }
  }

  errorOccurred (errorText) {
    this.props.dispatch(errorOccurred(errorText))
  }

  showLogin () {
    this.props.dispatch(dismissError())
    EqNavigation.push(this.props.componentId, {
      component: {
        name: LOGIN,
      }
    }).catch(e => { console.log(e) })
  }

  showTOS () {
    this.setState({
      showTOS: !this.state.showTOS
    })
  }

  toggleTOS () {
    this.setState({
      tosAccepted: !this.state.tosAccepted
    })
  }

  changeEmail (text) {
    this.setState({
      email: text
    })
  }

  changePassword1 (text) {
    this.setState({
      password1: text
    })
  }

  changePassword2 (text) {
    this.setState({
      password2: text
    })
  }

  moveToPassword () {
    this.inputs['pw1'].focus()
  }

  moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  submitSignup () {
    if (!this.state.password1) {
      this.errorOccurred('Yeah, gonna need a password.')
    } else if (this.state.password1 === this.state.password2) {
      this.setState({
        reqSubmitted: true,
      }, () => {
        Amplitude.logEvent(SIGN_UP)
        this.props.dispatch(submitSignup(this.state.email, this.state.password1)).then(() => {
          this.setState({
            reqSubmitted: false,
          })
        })
      })
    } else {
      this.errorOccurred('Passwords do not match')
    }
  }

  _renderSignupForm () {
    const TOSStyle = {flex: 1, justifyContent: 'flex-start', flexDirection: 'row'}
    if (width > 320) {
      TOSStyle.paddingLeft = (width - 320) / 1.5
      TOSStyle.paddingRight = (width - 320) / 1.5
    }
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    let button = <ActivityIndicator color={brand}/>
    if (!this.state.reqSubmitted) {
      button = <Button text={'Submit'} color={brand} onPress={this.submitSignup} disabled={!this.state.tosAccepted}/>
    }
    return (
      <View>
        <TOSModal
          modalOpen={this.state.showTOS}
          onClosed={this.showTOS}
        />
        <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
          <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Sign Up</Text>
        </View>
        <View style={{paddingLeft: 20, paddingRight: 20}}>
          <SignupForm
            changeEmail={this.changeEmail}
            changePassword1={this.changePassword1}
            changePassword2={this.changePassword2}
            inputs={this.inputs}
            moveToPassword={this.moveToPassword}
            moveToPassword2={this.moveToPassword2}
          />
        </View>
        <View style={styles.switchup}>
          <View style={TOSStyle}>
            <View style={{paddingRight: 20}}>
              <CheckBox
                checked={this.state.tosAccepted}
                onPress={this.toggleTOS}
              />
            </View>
            <TouchableOpacity style={{flex: 1}} onPress={this.showTOS}>
              <View style={{flex: 1, flexDirection: 'row', maxWidth: width}}>
                <Text style={{flex: 1}}>I accept the Equesteo <Text style={styles.underlineText}>Terms of Service.</Text></Text>
              </View>
            </TouchableOpacity>
          </View>
          { button }
          <TouchableOpacity onPress={this.showLogin} style={{paddingTop: 20}}>
            <Text style={styles.switchupText}>Or, <Text style={styles.underlineText}>Log In</Text>.</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderLoading () {
    return (
      <View style={{paddingTop: height / 3}}>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>Loading Data...</Text>
      </View>
    )
  }

  render() {
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          {
            this.props.doingInitialLoad ?
              <Loader
                paddingTop={height / 3}
                paddingBottom={20}
                docsToDownload={this.props.docsToDownload}
                docsDownloaded={this.props.docsDownloaded}
              />
            : this._renderSignupForm()
          }
        </View>
      </PageWrapper>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: "100%",
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
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
    flexWrap: 'wrap',
    flex: 1
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

export default connect(mapStateToProps)(SignupContainer)


