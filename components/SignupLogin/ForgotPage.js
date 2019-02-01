import React, { PureComponent } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { brand, darkBrand } from '../../colors'
import Button from '../Button'
import EmailInfoModal from './EmailInfoModal'

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
    this._moveToPassword2 = this._moveToPassword2.bind(this)
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

  _unsubmittedForm () {
    return (
      <View>
        <Text>Email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoFocus={true}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          style={styles.email}
          onSubmitEditing={this.getPWCode}
          onChangeText={this.changeEmail}
          returnKeyType="send"
          underlineColorAndroid="black"
          value={this.state.email}
          maxLength={200}
        />
        <Button text={'Submit'} color={brand} onPress={this.getPWCode}/>
      </View>
    )
  }

  _submittedForm () {
    return (
      <View>
        <Text>Enter the reset code from your email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoFocus={true}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          style={styles.email}
          onSubmitEditing={this.submitResetCode}
          onChangeText={this.changeResetCode}
          returnKeyType="send"
          underlineColorAndroid="black"
          value={this.state.resetCode}
          maxLength={30}
        />
        <Button text={'Submit'} color={brand} onPress={this.submitResetCode}/>
        <View style={{paddingTop: 20}}>
          <TouchableOpacity onPress={() => {this.setEmailInfoModalOpen(true)}}>
            <Text style={styles.switchupText}><Text style={styles.underlineText}>Didn't get an email?</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  _newPasswordForm () {
    return (
      <View>
        <Text>Password:</Text>
        <TextInput
          autoCapitalize={'none'}
          blurOnSubmit={false}
          onSubmitEditing={this._moveToPassword2}
          onChangeText={this.changePassword1}
          ref={(i) => this.inputs['pw1'] = i}
          returnKeyType="next"
          underlineColorAndroid="black"
          secureTextEntry={true}
          value={this.state.pw1}
          maxLength={200}
        />
        <Text>Password Again:</Text>
        <TextInput
          autoCapitalize={'none'}
          onSubmitEditing={this.submitNewPassword}
          secureTextEntry={true}
          onChangeText={this.changePassword2}
          ref={(i) => this.inputs['pw2'] = i}
          underlineColorAndroid="black"
          value={this.state.pw2}
          maxLength={200}
        />
        <Button text={'Change Password'} color={brand} onPress={this.submitNewPassword}/>
      </View>
    )
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
      form = this._submittedForm()
    } else if (!this.props.forgotSubmitted && !this.props.resetCodeSubmitted) {
      form = this._unsubmittedForm()
    } else if (this.props.resetCodeSubmitted && this.props.awaitingPWChange) {
      form = this._newPasswordForm()
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
    );
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
