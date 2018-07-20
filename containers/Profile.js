import React, { Component } from 'react'
import { connect } from 'react-redux';

import Profile from '../components/Profile'
import {
  changeScreen,
  clearSearch,
  createFollow,
  deleteFollow ,
  signOut,
  uploadProfilePhoto,
} from "../actions"
import { FEED, UPDATE_PROFILE } from '../screens'
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
    return !(!nextProps.profileUser || !nextProps.user )
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
                  screen: UPDATE_PROFILE,
                  title: 'Update Profile',
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
    if (event.id === 'willDisappear' && event.type === 'ScreenChangedEvent') {
      this.props.dispatch(changeScreen(FEED))
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
    this.props.dispatch(uploadProfilePhoto(location))
  }

  render() {
    return (
      <Profile
        createFollow={this.createFollow}
        deleteFollow={this.deleteFollow}
        follows={this.props.follows}
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
    profileUser: state.users[passedProps.profileUser._id] || passedProps.profileUser,
    user: state.users[state.localState.userID],
    follows: Object.values(state.follows).filter(f => !f.deleted && f.followerID === state.localState.userID)
  }
}

export default connect(mapStateToProps)(ProfileContainer)
