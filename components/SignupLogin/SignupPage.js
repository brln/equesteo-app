import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CheckBox } from 'native-base'

import Button from '../Button'
import { brand, darkBrand } from '../../colors'
import SignupForm from './SignupForm'
import TOSModal from './TOSModal'

export default class SignupPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: null,
      password1: null,
      password2: null,
      tosAccepted: false,
      showTOS: false,
    }
    this._renderSignupForm = this._renderSignupForm.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.moveToPassword = this.moveToPassword.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.showTOS = this.showTOS.bind(this)
    this.submitSignup = this.submitSignup.bind(this)
    this.toggleTOS = this.toggleTOS.bind(this)
    this.inputs = {}
  }

  showTOS () {
    this.setState({
      showTOS: !this.state.showTOS
    })
  }

  toggleTOS () {
    this.setState({
      tosAccepted: !this.state.tosAccepted
    })
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

  moveToPassword () {
    this.inputs['pw1'].focus()
  }

  moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  submitSignup () {
    if (!this.state.password1) {
      this.props.errorOccurred('Yeah, gonna need a password.')
    } else if (this.state.password1 === this.state.password2) {
      this.props.submitSignup(this.state.email, this.state.password2)
    } else {
      this.props.errorOccurred('Passwords do not match')
    }
  }

  _renderSignupForm () {
    return (
      <View>
        <TOSModal
          modalOpen={this.state.showTOS}
          onClosed={this.showTOS}
        />
        <SignupForm
          changeEmail={this.changeEmail}
          changePassword1={this.changePassword1}
          changePassword2={this.changePassword2}
          inputs={this.inputs}
          moveToPassword={this.moveToPassword}
          moveToPassword2={this.moveToPassword2}
        />
        <View style={styles.switchup}>
          <View style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'row'}}>
            <View style={{paddingRight: 20}}>
              <CheckBox
                checked={this.state.tosAccepted}
                onPress={this.toggleTOS}
              />
            </View>
            <TouchableOpacity onPress={this.showTOS}>
              <Text>I accept the Equesteo <Text style={styles.underlineText}>Terms of Service.</Text></Text>
            </TouchableOpacity>
          </View>
          <Button text={'Submit'} color={brand} onPress={this.submitSignup} disabled={!this.state.tosAccepted}/>
          <TouchableOpacity onPress={this.props.showLogin} style={{paddingTop: 10}}>
            <Text style={styles.switchupText}>Or, <Text style={styles.underlineText}>Log In</Text>.</Text>
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
        { this.props.doingInitialLoad ? this._renderLoading() : this._renderSignupForm() }
      </View>
    )
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
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
