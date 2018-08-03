import React, { Component } from 'react'
import { connect } from 'react-redux';

import { signOut } from '../actions'
import UpdateProfile from '../components/UpdateProfile'
import { updateUser, uploadProfilePhoto } from "../actions"
import NavigatorComponent from './NavigatorComponent'
import { logRender } from '../helpers'

class UpdateProfileContainer extends NavigatorComponent {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      }
    ],
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.user || (props.user && props.user.get('_rev') !== state.user.get('_rev'))) {
      nextState = {
        user: props.user,
        userMadeChanges: false
      }
    }
    return nextState
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      user: null,
    }
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.signOut = this.signOut.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  changeAccountDetails (user) {
    this.setState({
      userMadeChanges: true,
      user
    })
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.props.dispatch(updateUser(this.state.user))
        this.props.navigator.pop()
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
    logRender('UpdateProfileContainer')
    return (
      <UpdateProfile
        user={this.state.userMadeChanges ? this.state.user : this.props.user }
        changeAccountDetails={this.changeAccountDetails}
        navigator={this.props.navigator}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const user = mainState.get('users').get(localState.get('userID'))
  return {
    user
  }
}

export default connect(mapStateToProps)(UpdateProfileContainer)
