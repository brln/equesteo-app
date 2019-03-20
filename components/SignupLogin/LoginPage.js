import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Button from '../Button'
import { brand, darkBrand } from '../../colors'
import LoginForm from './LoginForm'

const { height } = Dimensions.get('window')

export default class LoginPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      cursor: 0,
      email: null,
      password: null,
      passwordVisible: false
    }
    this.inputs = {}
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this._renderLoginForm = this._renderLoginForm.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.togglePasswordVisible = this.togglePasswordVisible.bind(this)
  }

  togglePasswordVisible () {
    this.setState({
      passwordVisible: !this.state.passwordVisible
    })
    this.inputs.password.blur()
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
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    return (
      <View>
        <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
          <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Log In</Text>
        </View>
        <LoginForm
          changeEmail={this.changeEmail}
          changePassword={this.changePassword}
          cursor={this.state.cursor}
          inputs={this.inputs}
          moveToPassword={this.moveToPassword}
          passwordVisible={this.state.passwordVisible}
          submitLogin={this.submitLogin}
          togglePasswordVisible={this.togglePasswordVisible}
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
      <View style={{paddingTop: height / 3}}>
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
    width: "100%",
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  switchupText: {
    textAlign: 'center',
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
