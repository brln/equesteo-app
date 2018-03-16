import React, { Component } from 'react';

import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default class SignupForm extends Component {
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
        <Text style={styles.whiteText}>Email:</Text>
        <TextInput
          autoFocus={true}
          blurOnSubmit={false}
          style={styles.email}
          onSubmitEditing={this.moveToPassword}
          onChangeText={this.changeEmail}
          returnKeyType="next"
          ref={(i) => this.inputs['email'] = i}
          underlineColorAndroid="white"
        />
        <Text style={styles.whiteText}>Password:</Text>
        <TextInput
          blurOnSubmit={false}
          onSubmitEditing={this.moveToPassword2}
          onChangeText={this.changePassword1}
          ref={(i) => this.inputs['pw1'] = i}
          returnKeyType="next"
          underlineColorAndroid="white"
          secureTextEntry={true}
        />
        <Text style={styles.whiteText}>Password Again:</Text>
        <TextInput
          onSubmitEditing={this.submitSignup}
          secureTextEntry={true}
          style={styles.whiteText}
          onChangeText={this.changePassword2}
          ref={(i) => this.inputs['pw2'] = i}
          underlineColorAndroid="white"
        />
        <View style={styles.switchup}>
          <Text style={styles.switchupText} onPress={this.props.switchSignup}>Or, <Text style={styles.underlineText}>Log In</Text>.</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    width: "100%",
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 30,
  },
  email: {
    borderColor: 'gray',
    color: 'white',
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
    color: 'white'
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  whiteText: {
    color: 'white'
  }
});
