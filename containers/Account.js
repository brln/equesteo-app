import React, { Component } from 'react'
import { connect } from 'react-redux';

import { signOut } from '../actions'
import Account from '../components/Account'
import { changeScreen, updateUser, uploadProfilePhoto } from "../actions"
import { FEED } from '../screens'

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

  shouldComponentUpdate (nextProps) {
    return !!nextProps.userData
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.userData || (props.userData && props.userData._rev !== state.userData._rev)) {
      nextState = {
        userData: props.userData,
        userMadeChanges: false
      }
    }
    return nextState
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
      userData: { ...this.state.userData, ...newDetails }
    })
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.props.dispatch(updateUser(this.state.userData))
        this.props.navigator.popToRoot({animated: false, animationType: 'none'})
        this.props.dispatch(changeScreen(FEED))
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
    userData: state.users[state.localState.userID]
  }
}

export default connect(mapStateToProps)(AccountContainer)
