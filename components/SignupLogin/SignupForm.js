import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default class SignupForm extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      password1: null,
      password2: null,
      showMismatch: false,
    }
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
    this.inputs = {}
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
    if (this.state.password1 === this.state.password2) {
      this.props.submitSignup(this.state.email, this.state.password2)
    } else {
      this.setState({
        showMismatch: true
      })
    }
  }

  render() {
    let dontMatchMessage = <Text>The passwords do not match</Text>
    return (
      <View style={styles.container}>
        { this.state.showMismatch ? dontMatchMessage : null }
        <Text>Email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoFocus={true}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          style={styles.email}
          onSubmitEditing={this.moveToPassword}
          onChangeText={this.changeEmail}
          returnKeyType="next"
          ref={(i) => this.inputs['email'] = i}
          underlineColorAndroid="black"
        />
        <Text>Password:</Text>
        <TextInput
          autoCapitalize={'none'}
          blurOnSubmit={false}
          onSubmitEditing={this.moveToPassword2}
          onChangeText={this.changePassword1}
          ref={(i) => this.inputs['pw1'] = i}
          style={styles.whiteText}
          returnKeyType="next"
          underlineColorAndroid="black"
          secureTextEntry={true}
        />
        <Text>Password Again:</Text>
        <TextInput
          autoCapitalize={'none'}
          onSubmitEditing={this.submitSignup}
          secureTextEntry={true}
          style={styles.whiteText}
          onChangeText={this.changePassword2}
          ref={(i) => this.inputs['pw2'] = i}
          underlineColorAndroid="black"
        />
        <View style={styles.switchup}>
          <TouchableOpacity onPress={this.props.showLogin}>
            <Text style={styles.switchupText}>Or, <Text style={styles.underlineText}>Log In</Text>.</Text>
          </TouchableOpacity>
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
  email: {
    borderColor: 'gray',
  },
  password: {
    borderColor: 'gray',
    width: 80,
  },
  switchup: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  switchupText: {
    textAlign: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
