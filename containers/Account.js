import React, { Component } from 'react'
import { connect } from 'react-redux';

import { signOut } from '../actions'
import Account from '../components/Account'
import { updateProfile, uploadProfilePhoto } from "../actions"

class AccountContainer extends Component {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      }
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      userData: null,
    }
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.signOut = this.signOut.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)


    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  changeAccountDetails (newDetails) {
    this.setState({
      userMadeChanges: true,
      userData: Object.assign({}, this.props.userData, newDetails)
    })
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.props.dispatch(updateProfile(this.state.userData))
      }
    }
  }

  signOut () {
    this.props.dispatch(signOut())
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  render() {
    return (
      <Account
        userData={this.state.userMadeChanges ? this.state.userData : this.props.userData }
        changeAccountDetails={this.changeAccountDetails}
        navigator={this.props.navigator}
        signOut={this.signOut}
        uploadProfilePhoto={this.uploadProfilePhoto}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    userData: state.userData
  }
}

export default connect(mapStateToProps)(AccountContainer)
