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
import { UPDATE_PROFILE } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class ProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.yourHorses = this.yourHorses.bind(this)
    this.yourFollows = this.yourFollows.bind(this)
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

  yourHorses () {
    return this.props.horses.toList().filter(h => {
      return h.get('userID') === this.props.user.get('_id') && h.get('deleted') !== true
    })
  }

  yourFollows () {
    return this.props.follows.filter(f => !f.get('deleted') && f.get('followerID') === this.props.user.get('_id'))
  }

  render() {
    console.log('rendering ProfileContainer')
    if (!(!this.props.profileUser || !this.props.user )) {
      return (
        <Profile
          createFollow={this.createFollow}
          deleteFollow={this.deleteFollow}
          follows={this.props.follows}
          horses={this.yourHorses()}
          navigator={this.props.navigator}
          profileUser={this.props.profileUser}
          uploadProfilePhoto={this.uploadProfilePhoto}
          user={this.props.user}
        />
      )
    } else {
      return null
    }

  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = state.getIn(['main', 'localState'])
  const userID = localState.get('userID')

  return {
    horses: mainState.get('horses'),
    profileUser: mainState.getIn(['users', passedProps.profileUser.get('_id')]) || passedProps.profileUser,
    user: mainState.getIn(['users', userID]),
    follows: mainState.get('follows')
  }
}

export default connect(mapStateToProps)(ProfileContainer)
