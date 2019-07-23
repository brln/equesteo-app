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
import UnsubmittedForm from '../../components/SignupLogin/UnsubmittedForm'
import PageWrapper from '../../components/SignupLogin/PageWrapper'
import { SIGNUP, LOGIN, RESET_CODE } from '../../screens/consts/main'
import {
  dismissError,
  errorOccurred,
  setForgotEmail,
} from '../../actions/standard'
import { getPWCode, switchRoot } from '../../actions/functional'
import EqNavigation from '../../services/EqNavigation'

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
      resetCode: null,
      pw1: null,
      pw2: null,
      emailInfoModalOpen: false,
    }
    this.changeEmail = this.changeEmail.bind(this)
    this.enterCode = this.enterCode.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.showSignup = this.showSignup.bind(this)
  }

  componentDidUpdate (nextProps) {
    if (this.props.error) {
      setTimeout(() => {
        this.props.dispatch(dismissError())
      }, 3000)
    }
  }

  changeEmail (text) {
    this.props.dispatch(setForgotEmail(text))
  }

  getPWCode () {
    this.props.dispatch(getPWCode(this.props.forgotEmail)).then(() => {
      this.props.dispatch(switchRoot(RESET_CODE))
    }).catch(e => {
      this.props.dispatch(errorOccurred(e.message))
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

  enterCode () {
    this.props.dispatch(switchRoot(RESET_CODE))
  }

  render() {
    const paddingTop = height - 590 > 0 ? (height - 590) / 5 : 0
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          <View style={styles.container}>
            <EmailInfoModal
              modalOpen={this.state.emailInfoModalOpen}
              closeModal={() => {this.setEmailInfoModalOpen(false)}}
            />
            <View style={{paddingBottom: 40, alignItems: 'center', paddingTop}}>
              <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Reset Password</Text>
            </View>
            <UnsubmittedForm
              changeEmail={this.changeEmail}
              email={this.props.forgotEmail}
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
    paddingTop: 30,
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
    forgotEmail: localState.get('forgotEmail'),
  }
}

export default connect(mapStateToProps)(ForgotContainer)
