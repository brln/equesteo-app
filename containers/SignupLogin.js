import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { dismissError, submitLogin, submitSignup } from '../actions'
import SignupForm from '../components/SignupForm'
import LoginForm from '../components/LoginForm'

class SignupLoginContainer extends Component {
  static navigatorStyle = {
    navBarHidden: true
  }

  constructor (props) {
    super(props)
    this.state = {
      signup: false,
    }
    this.submitSignup = this.submitSignup.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
    this.switchSignup = this.switchSignup.bind(this)
  }

  submitSignup (email, password) {
    this.props.dispatch(submitSignup(email, password))
  }

  submitLogin (email, password) {
    this.props.dispatch(submitLogin(email, password))
  }

  switchSignup () {
    this.props.dispatch(dismissError())
    this.setState({
      signup: !this.state.signup
    })
  }

  render() {
    let form = (
      <LoginForm
        submitLogin={this.submitLogin}
        switchSignup={this.switchSignup}
      />
    )
    if (this.state.signup) {
      form = (
        <SignupForm
          submitSignup={this.submitSignup}
          switchSignup={this.switchSignup}
        />
      )
    }
    const error = this.props.error ? <Text style={styles.errorBox}>{this.props.error}</Text> : null
    return (
        <View style={styles.container}>
          {error}
          <Image
            source={require('../img/loginbg2.jpg')}
            style={{width: "100%", height: "100%"}}
          />
          {form}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  errorBox: {
    marginTop: 40,
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'red',
  }
});

function mapStateToProps (state) {
  return {
    error: state.localState.error
  }
}

export default connect(mapStateToProps)(SignupLoginContainer)
