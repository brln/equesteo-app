import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'

import NewPasswordForm from '../../components/SignupLogin/NewPasswordForm'
import PageWrapper from '../../components/SignupLogin/PageWrapper'
import { dismissError, errorOccurred } from '../../actions/standard'
import functional from '../../actions/functional'
import Loader from '../../components/SignupLogin/Loader'
import SignupContainerParent  from './SignupContainerParent'

const { height, width } = Dimensions.get('window');

class NewPasswordContainer extends SignupContainerParent  {
  constructor (props) {
    super(props)
    this.state = {
      pw1: null,
      pw2: null,
    }
    this.inputs = {}

    this.changePassword1 = this.changePassword1.bind(this)
    this.changePassword2 = this.changePassword2.bind(this)
    this.moveToPassword2 = this.moveToPassword2.bind(this)
    this.submitNewPassword = this.submitNewPassword.bind(this)
  }

  changePassword1 (text) {
    this.setState({
      pw1: text
    })
  }

  changePassword2 (text) {
    this.setState({
      pw2: text
    })
  }

  submitNewPassword () {
    if (this.state.pw1 !== this.state.pw2) {
      this.props.dispatch(errorOccurred('Passwords do not match.'))
    } else {
      this.props.dispatch(functional.newPassword(this.state.pw1)).catch(e => {
        this.props.dispatch(errorOccurred(e))
      })
    }
  }

  moveToPassword2() {
    this.inputs['pw2'].focus()
  }

  _renderForm () {
    const paddingTop = height - 590 > 0 ? (height - 590) / 3 : 0
    return (
      <View style={styles.container}>
        <View style={{paddingBottom: 20, alignItems: 'center', paddingTop}}>
          <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 20, textAlign: 'center'}}>Enter New Password</Text>
        </View>
        <NewPasswordForm
          moveToPassword2={this.moveToPassword2}
          changePassword1={this.changePassword1}
          changePassword2={this.changePassword2}
          inputs={this.inputs}
          pw1={this.state.pw1}
          pw2={this.state.pw2}
          submitNewPassword={this.submitNewPassword}
        />
      </View>
    )
  }

  render() {
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          { this.props.doingInitialLoad ?
            <Loader
              paddingTop={height / 3}
              paddingBottom={20}
              docsToDownload={this.props.docsToDownload}
              docsDownloaded={this.props.docsDownloaded}
            />
            : this._renderForm()
          }
        </View>
      </PageWrapper>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    width,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 30,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  switchupText: {
    textAlign: 'center',
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
})

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    awaitingPWChange: localState.get('awaitingPWChange'),
    doingInitialLoad: localState.get('doingInitialLoad'),
    docsToDownload: localState.get('docsToDownload'),
    docsDownloaded: localState.get('docsDownloaded'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(NewPasswordContainer)
