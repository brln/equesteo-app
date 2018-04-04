import React, { Component } from 'react';
import {
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
        <Text style={styles.whiteText}>Email:</Text>
        <TextInput
          autoFocus={true}
          blurOnSubmit={false}
          style={styles.email}
          onChangeText={this.changeEmail}
          onSubmitEditing={this.moveToPassword}
          ref={(i) => this.inputs['email'] = i}
          underlineColorAndroid="white"
        />
        <Text style={styles.whiteText}>Password:</Text>
        <TextInput
          onChangeText={this.changePassword}
          onSubmitEditing={this.submitLogin}
          secureTextEntry={true}
          style={styles.whiteText}
          ref={(i) => this.inputs['password'] = i}
          underlineColorAndroid="white"
        />
        <View style={styles.switchup}>
          <Text style={styles.switchupText} onPress={this.props.switchSignup}>Or, <Text style={styles.underlineText}>Sign Up</Text>.</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
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
    color: 'white'
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
