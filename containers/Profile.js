import React, { Component } from 'react'
import { connect } from 'react-redux';

import Profile from '../components/Profile'
import { createFollow, deleteFollow } from "../actions"

class ProfileContainer extends Component {
  constructor (props) {
    super(props)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
  }

  createFollow (followingID) {
    this.props.dispatch(createFollow(followingID))
  }

  deleteFollow (followingID) {
    this.props.dispatch(deleteFollow(followingID))
  }

  render() {
    return (
      <Profile
        createFollow={this.createFollow}
        deleteFollow={this.deleteFollow}
        user={this.props.user}
        userData={this.props.userData}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    user: passedProps.user,
    userData: state.userData
  }
}

export default connect(mapStateToProps)(ProfileContainer)
