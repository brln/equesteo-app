import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
        <View>
          <Text>Email:</Text>
          <TextInput
            autoCapitalize={'none'}
            blurOnSubmit={false}
            keyboardType={'email-address'}
            style={styles.email}
            onChangeText={this.changeEmail}
            onSubmitEditing={this.moveToPassword}
            ref={(i) => this.inputs['email'] = i}
            underlineColorAndroid="black"
          />
          <Text>Password:</Text>
          <TextInput
            autoCapitalize={'none'}
            onChangeText={this.changePassword}
            onSubmitEditing={this.submitLogin}
            secureTextEntry={true}
            style={styles.whiteText}
            ref={(i) => this.inputs['password'] = i}
            underlineColorAndroid="black"
          />

          <View>
            <TouchableOpacity onPress={this.props.showSignup}>
              <View style={styles.switchup} >
                <Text style={styles.switchupText} >Or, <Text style={styles.underlineText}>Sign Up</Text>.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.props.showForgot}>
              <View>
                <Text style={styles.switchupText}><Text style={styles.underlineText}>Forgot Your Password?</Text></Text>
              </View>
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
  email: {
    borderColor: 'gray',
  },
  password: {
    borderColor: 'gray',
    width: 80,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  switchupText: {
    textAlign: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
