import React, { PureComponent } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { darkBrand } from '../../colors'

export default class ForgotPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      resetCode: null,
      pw1: null,
      pw2: null,
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.changeResetCode = this.changeResetCode.bind(this)
    this.getPWCode = this.getPWCode.bind(this)
    this.submitResetCode = this.submitResetCode.bind(this)
    this._moveToPassword2 = this._moveToPassword2.bind(this)
    this.submitNewPassword = this.submitNewPassword.bind(this)
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
      </View>
    )
  }

  _submittedForm () {
    return (
      <View>
        <Text>Enter your reset code:</Text>
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
      </View>
    )
  }

  render() {
    let form
    if (this.props.forgotSubmitted && !this.props.resetCodeSubmitted) {
      form = this._submittedForm()
    } else if (!this.props.forgotSubmitted && !this.props.resetCodeSubmitted) {
      form = this._unsubmittedForm()
    } else if (this.state.resetCodeSubmitted && !this.props.awaitingPWChange) {
      form = (
        <View>
          <ActivityIndicator size="large" color={darkBrand} />
          <Text style={{textAlign: 'center', color: darkBrand}}>Loading...</Text>
        </View>
      )
    } else if (this.props.resetCodeSubmitted && this.props.awaitingPWChange) {
      form = this._newPasswordForm()
    }
    return (
      <View style={styles.container}>
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
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    width: "100%",
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 30,
  },
  switchup: {
    paddingTop: 20,
    paddingBottom: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  switchupText: {
    textAlign: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
