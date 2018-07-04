import React, { Component } from 'react'
import { connect } from 'react-redux';

import Profile from '../components/Profile'
import { clearSearch, createFollow, deleteFollow } from "../actions"
import NavigatorComponent from './NavigatorComponent'

class ProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
  }

  createFollow (followingID) {
    this.props.dispatch(createFollow(followingID))
    this.props.dispatch(clearSearch())
  }

  deleteFollow (followingID) {
    this.props.dispatch(deleteFollow(followingID))
  }

  render() {
    return (
      <Profile
        createFollow={this.createFollow}
        deleteFollow={this.deleteFollow}
        horses={this.props.horses}
        navigator={this.props.navigator}
        profileUser={this.props.profileUser}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses.filter((h) => h.userID === passedProps.user._id && h.deleted !== true),
    profileUser: passedProps.user,
    user: state.users[state.localState.userID]
  }
}

export default connect(mapStateToProps)(ProfileContainer)
