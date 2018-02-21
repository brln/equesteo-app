import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  View
} from 'react-native';
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'


export default class SignupSignin extends Component {
  SIGNUP = 'signup'
  SIGNIN = 'signin'

  constructor (props) {
    super(props)
    this.state = {
      currentView: this.SIGNIN,
    }
    this.viewSignin = this.viewSignin.bind(this)
    this.viewSignup = this.viewSignup.bind(this)
  }

  viewSignin () {
    this.setState({
      currentView: this.SIGNIN
    })
  }

  viewSignup () {
    this.setState({
      currentView: this.SIGNUP
    })
  }

  render() {
    let shown = (
      <View style={styles.container}>
        <Button onPress={this.viewSignin} title="Sign In" />
        <SignupForm
          submitSignup={this.props.submitSignup}
        />
      </View>
    )
    if (this.state.currentView === this.SIGNIN) {
      shown = (
        <View style={styles.container}>
          <Button onPress={this.viewSignup} title="Sign Up" />
          <LoginForm
            submitLogin={this.props.submitLogin}
          />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        {shown}
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
  }
});
