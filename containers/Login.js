import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'
import {
  StyleSheet,
  View
} from 'react-native';

import { submitLogin } from '../actions'
import LoginForm from '../components/LoginForm'

class LoginContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
    }
    this.submitLogin = this.submitLogin.bind(this)
  }

  async submitLogin (email, password) {
    this.props.dispatch(submitLogin(email, password))
  }

  render() {
    return (
      <View style={styles.container}>
        <LoginForm
          submitLogin={this.submitLogin}
        />
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
  }
});

function mapStateToProps (state) {
  return state
}

export default  connect(mapStateToProps)(LoginContainer)
