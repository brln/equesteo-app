import React, { Component } from 'react';
import { API_URL } from 'react-native-dotenv';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default class LoginForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      password: null
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.moveToPassword = this.moveToPassword.bind(this);
    this.submitLogin = this.submitLogin.bind(this)
  }

  changeEmail (text) {
    this.setState({
      email: text
    })
  }

  changePassword (text) {
    this.setState({
      password: text
    })
  }

  submitLogin () {
    this.props.submitLogin(this.state.email, this.state.password)
  }


  moveToPassword (e) {
    this.inputs['password'].focus()
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Email:</Text>
        <TextInput
          autoFocus={true}
          blurOnSubmit={false}
          style={styles.email}
          onChangeText={this.changeEmail}
          onSubmitEditing={this.moveToPassword}
          ref={(i) => this.inputs['email'] = i}
        />
        <Text>Password:</Text>
        <TextInput
          onChangeText={this.changePassword}
          onSubmitEditing={this.submitLogin}
          secureTextEntry={true}
          ref={(i) => this.inputs['password'] = i}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    padding: 30,
  },
  email: {
    borderColor: 'gray',
  },
  password: {
    borderColor: 'gray',
    width: 80,
  },
});
