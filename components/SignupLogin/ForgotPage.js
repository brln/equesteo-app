import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { darkBrand } from '../../colors'
import EmailInfoModal from './EmailInfoModal'
import NewPasswordForm from './NewPasswordForm'
import SubmittedForm from './SubmittedForm'
import UnsubmittedForm from './UnsubmittedForm'

const { width } = Dimensions.get('window');

export default class ForgotPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      resetCode: null,
      pw1: null,
      pw2: null,
      emailInfoModalOpen: false,
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.changeResetCode = this.changeResetCode.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this._renderForm = this._renderForm.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.setEmailInfoModalOpen = this.setEmailInfoModalOpen.bind(this)
    this.submitResetCode = this.submitResetCode.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.submitNewPassword = this.submitNewPassword.bind(this)
  }

  setEmailInfoModalOpen (value) {
    this.setState({
      emailInfoModalOpen: value
    })
  }

  changeEmail (text) {
    this.setState({
      email: text
    })
  }

  changeResetCode (text) {
    this.setState({
      resetCode: text
    })
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

  getPWCode () {
    this.props.getPWCode(this.state.email)
  }

  submitResetCode () {
    this.props.exchangePWCode(this.state.email, this.state.resetCode)
  }

  submitNewPassword () {
    if (this.state.pw1 !== this.state.pw2) {
      this.props.errorOccurred('Passwords do not match.')
    } else {
      this.props.newPassword(this.state.pw2)
    }
  }

  moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  _renderLoading () {
    return (
      <View>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>Loading Data...</Text>
      </View>
    )
  }

  _renderForm() {
    let form
    if (this.props.forgotSubmitted && !this.props.resetCodeSubmitted) {
      form = (
        <SubmittedForm
          changeResetCode={this.changeResetCode}
          resetCode={this.state.resetCode}
          setEmailInfoModalOpen={this.setEmailInfoModalOpen}
          submitResetCode={this.submitResetCode}
        />
      )
    } else if (!this.props.forgotSubmitted && !this.props.resetCodeSubmitted) {
      form = (
        <UnsubmittedForm
          changeEmail={this.changeEmail}
          email={this.state.email}
          getPWCode={this.getPWCode}
          inputs={this.inputs}
        />
      )
    } else if (this.props.resetCodeSubmitted && this.props.awaitingPWChange) {
      form = (
        <NewPasswordForm
          moveToPassword2={this.moveToPassword2}
          changePassword1={this.changePassword1}
          changePassword2={this.changePassword2}
          inputs={this.inputs}
          pw1={this.state.pw1}
          pw2={this.state.pw2}
          submitNewPassword={this.submitNewPassword}
        />
      )
    }
    return (
      <View style={styles.container}>
        <EmailInfoModal
          modalOpen={this.state.emailInfoModalOpen}
          closeModal={() => {this.setEmailInfoModalOpen(false)}}
        />
        { form }
        <View style={styles.switchup}>
          <View>
            <TouchableOpacity onPress={this.props.showLogin}>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Log In</Text> or </Text>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity onPress={this.props.showSignup}>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.doingInitialLoad && !this.props.awaitingPWChange ? this._renderLoading() : this._renderForm() }
      </View>
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
});
