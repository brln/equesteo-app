import React, { Component } from 'react';

import {
  Button,
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
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword1 = this.changePassword1.bind(this);
    this.changePassword2 = this.changePassword2.bind(this);
    this.submitSignup = this.submitSignup.bind(this)
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
        <TextInput style={styles.email} onChangeText={this.changeEmail}/>
        <Text>Password:</Text>
        <TextInput onChangeText={this.changePassword1}/>
        <Text>Password Again:</Text>
        <TextInput onChangeText={this.changePassword2}/>
        <View style={styles.submitButton}>
          <Button onPress={this.submitSignup} title="submit"/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  email: {
    borderColor: 'gray',
  },
  password: {
    borderColor: 'gray',
    width: 80,
  },
  submitButton: {
    width: 80
  }
});
