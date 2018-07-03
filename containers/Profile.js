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
        horses={this.props.horses}
        deleteFollow={this.deleteFollow}
        user={this.props.user}
        userData={this.props.userData}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses.filter((h) => h.userID === passedProps.user._id && h.deleted !== true),
    user: passedProps.user,
    userData: state.users[state.localState.userID]
  }
}

export default connect(mapStateToProps)(ProfileContainer)
