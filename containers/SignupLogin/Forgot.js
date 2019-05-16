import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import { darkBrand } from '../../colors'
import EmailInfoModal from '../../components/SignupLogin/EmailInfoModal'
import NewPasswordForm from '../../components/SignupLogin/NewPasswordForm'
import SubmittedForm from '../../components/SignupLogin/SubmittedForm'
import UnsubmittedForm from '../../components/SignupLogin/UnsubmittedForm'
import PageWrapper from '../../components/SignupLogin/PageWrapper'
import EqNavigation from '../../services/EqNavigation'
import { SIGNUP, LOGIN, RESET_CODE } from '../../screens/main'
import {
  dismissError,
  errorOccurred,
} from '../../actions/standard'
import { getPWCode } from '../../actions/functional'

const { height, width } = Dimensions.get('window');

class ForgotContainer extends PureComponent {
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

  constructor (props) {
    super(props)
    this.state = {
      email: null,
      resetCode: null,
      pw1: null,
      pw2: null,
      emailInfoModalOpen: false,
    }
    this.changeEmail = this.changeEmail.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this._renderForm = this._renderForm.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.showSignup = this.showSignup.bind(this)
  }

  changeEmail (text) {
    this.setState({
      email: text
    })
  }

  getPWCode () {
    this.props.dispatch(getPWCode(this.state.email)).then(() => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: RESET_CODE,
          passProps: {
            email: this.state.email
          }
        }
      })
    })
  }

  _renderLoading () {
    return (
      <View>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>Loading Data...</Text>
      </View>
    )
  }

  showSignup () {
    this.props.dispatch(dismissError())
    EqNavigation.push(this.props.componentId, {
      component: {
        name: SIGNUP,
      }
    }).catch(e => { console.log(e) })
  }

  showLogin () {
    this.props.dispatch(dismissError())
    EqNavigation.push(this.props.componentId, {
      component: {
        name: LOGIN,
      }
    }).catch(e => { console.log(e) })
  }


  _renderForm() {
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    return (
      <View style={styles.container}>
        <EmailInfoModal
          modalOpen={this.state.emailInfoModalOpen}
          closeModal={() => {this.setEmailInfoModalOpen(false)}}
        />
        <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
          <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Reset Password</Text>
        </View>
        <UnsubmittedForm
          changeEmail={this.changeEmail}
          email={this.state.email}
          getPWCode={this.getPWCode}
          inputs={this.inputs}
        />
        <View style={styles.switchup}>
          <View>
            <TouchableOpacity onPress={this.showLogin}>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Log In</Text> or </Text>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity onPress={this.showSignup}>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Sign Up</Text></Text>
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
          { this.props.doingInitialLoad && !this.props.awaitingPWChange ? this._renderLoading() : this._renderForm() }
        </View>
      </PageWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    width,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 30,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
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
    awaitingPWChange: localState.get('awaitingPWChange'),
    doingInitialLoad: localState.get('doingInitialLoad'),
    docsToDownload: localState.get('docsToDownload'),
    docsDownloaded: localState.get('docsDownloaded'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(ForgotContainer)
