import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
  StyleSheet,
  View
} from 'react-native';

import { submitSignup } from '../actions'
import SignupForm from '../components/SignupForm'

class SignupContainer extends Component {
  constructor (props) {
    super(props)
    // @TODO: Figure out how to persist this.
    this.state = {
      error: null,
    }
    this.submitSignup = this.submitSignup.bind(this)
  }

  async submitSignup (email, password) {
    this.props.dispatch(submitSignup(email, password))
  }

  render() {
    return (
      <View style={styles.container}>
        <SignupForm
          submitSignup={this.submitSignup}
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

export default connect(mapStateToProps)(SignupContainer)
