import React, { Component } from 'react'
import { connect } from 'react-redux';

import Profile from '../components/Profile/Profile'
import {
  clearSearch,
  createFollow,
  deleteFollow ,
  signOut,
  uploadProfilePhoto,
} from "../actions"
import { UPDATE_PROFILE } from '../screens'
import NavigatorComponent from './NavigatorComponent'
import { logRender } from '../helpers'

class ProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
    this.followings = this.followings.bind(this)
    this.followers = this.followers.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.yourHorses = this.yourHorses.bind(this)
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'edit') {
        this.props.navigator.dismissAllModals()
        this.props.navigator.push({
          screen: UPDATE_PROFILE,
          title: 'Update Profile',
          animationType: 'slide-up',
        });
      } else if (event.id == 'logout') {
        this.props.dispatch(signOut())
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
    return this.props.horses.valueSeq().filter(h => {
      return h.get('userID') === this.props.profileUser.get('_id') && h.get('deleted') !== true
    }).toList()
  }

  followings () {
    return this.props.follows.filter(
      f => !f.get('deleted') && f.get('followerID') === this.props.profileUser.get('_id')
    )
  }

  followers () {
    return this.props.follows.filter(
      f => !f.get('deleted') && f.get('followingID') === this.props.profileUser.get('_id')
    )
  }

  render() {
    logRender('ProfileContainer')
    if (!(!this.props.profileUser || !this.props.user )) {
      return (
        <Profile
          createFollow={this.createFollow}
          deleteFollow={this.deleteFollow}
          followings={this.followings()}
          followers={this.followers()}
          horses={this.yourHorses()}
          navigator={this.props.navigator}
          profileUser={this.props.profileUser}
          uploadProfilePhoto={this.uploadProfilePhoto}
          user={this.props.user}
          users={this.props.users}
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
    follows: mainState.get('follows'),
    users: mainState.get('users')
  }
}

export default connect(mapStateToProps)(ProfileContainer)
