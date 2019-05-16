import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import EmailInfoModal from '../../components/SignupLogin/EmailInfoModal'
import NewPasswordForm from '../../components/SignupLogin/NewPasswordForm'
import PageWrapper from '../../components/SignupLogin/PageWrapper'
import { errorOccurred } from '../../actions/standard'
import { newPassword } from '../../actions/functional'

const { height, width } = Dimensions.get('window');

class NewPasswordContainer extends PureComponent {
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
      pw1: null,
      pw2: null,
    }
    this.inputs = {}

    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.submitNewPassword = this.submitNewPassword.bind(this)
  }

  changePassword1 (text) {
    this.setState({
      pw1: text
    })
  }

  changePassword2 (text) {
    this.setState({
      pw2: text
    })
  }

  submitNewPassword () {
    if (this.state.pw1 !== this.state.pw2) {
      this.props.dispatch(errorOccurred('Passwords do not match.'))
    } else {
      this.props.dispatch(newPassword(this.state.pw1)).catch(e => {
        this.props.dispatch(errorOccurred(e))
      })
    }
  }

  moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  @TODO make this show the spinner while syncing in the same way the login page does
  @TODO: spinner on reset code page while call is being made, handle timeout

  render() {
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          <View style={styles.container}>
            <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
              <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Reset Password</Text>
            </View>
            <NewPasswordForm
              moveToPassword2={this.moveToPassword2}
              changePassword1={this.changePassword1}
              changePassword2={this.changePassword2}
              inputs={this.inputs}
              pw1={this.state.pw1}
              pw2={this.state.pw2}
              submitNewPassword={this.submitNewPassword}
            />
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

export default connect(mapStateToProps)(NewPasswordContainer)
