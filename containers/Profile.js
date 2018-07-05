import React, { Component } from 'react'
import { connect } from 'react-redux';

import Profile from '../components/Profile'
import {
  clearSearch,
  createFollow,
  deleteFollow ,
  signOut,
  uploadProfilePhoto,
} from "../actions"
import { ACCOUNT } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class ProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
  }

  shouldComponentUpdate (nextProps) {
    // When you log out there is no profileUser but it tries to render
    // and blows up.
    return !!nextProps.profileUser
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'dropdown') {
        this.props.navigator.showContextualMenu(
          {
            rightButtons: [
              {
                title: 'Edit',
              },
              {
                title: 'Log Out',
              }
            ],
            onButtonPressed: (index) => {
              if (index === 0) {
                this.props.navigator.dismissAllModals()
                this.props.navigator.push({
                  screen: ACCOUNT,
                  title: 'Update Account',
                  animationType: 'slide-up',
                });
              } else if (index === 1) {
                this.props.dispatch(signOut())
              }
            }
          }
        );
      }
    }
  }

  createFollow (followingID) {
    this.props.dispatch(createFollow(followingID))
    this.props.dispatch(clearSearch())
  }

  deleteFollow (followingID) {
    this.props.dispatch(deleteFollow(followingID))
  }

  uploadProfilePhoto (location) {
    console.log(location)
    this.props.dispatch(uploadProfilePhoto(location))
  }

  render() {
    return (
      <Profile
        createFollow={this.createFollow}
        deleteFollow={this.deleteFollow}
        horses={this.props.horses}
        navigator={this.props.navigator}
        profileUser={this.props.profileUser}
        uploadProfilePhoto={this.uploadProfilePhoto}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses.filter((h) => h.userID === passedProps.profileUser._id && h.deleted !== true),
    profileUser: state.users[passedProps.profileUser._id],
    user: state.users[state.localState.userID],
  }
}

export default connect(mapStateToProps)(ProfileContainer)
