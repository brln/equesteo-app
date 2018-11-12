import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Button from '../Button'
import { brand, darkBrand } from '../../colors'
import LoginForm from './LoginForm'

export default class LoginPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      password: null
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this._renderLoginForm = this._renderLoginForm.bind(this)
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

  _renderLoginForm () {
    return (
      <View>
        <LoginForm
          changeEmail={this.changeEmail}
          moveToPassword={this.moveToPassword}
          changePassword={this.changePassword}
          submitLogin={this.submitLogin}
          inputs={this.inputs}
        />
        <View>
          <Button text={'Submit'} color={brand} onPress={this.submitLogin}/>
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

  render() {
    return (
      <View style={styles.container}>
        { this.props.doingInitialLoad ? this._renderLoading() : this._renderLoginForm() }
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  switchupText: {
    textAlign: 'center',
    fontSize: 10,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
