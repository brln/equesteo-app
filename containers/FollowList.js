import { List } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux';

import { logRender } from '../helpers'
import NavigatorComponent from './NavigatorComponent'
import FollowList from '../components/FollowList'

class FollowListContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
  }

  render() {
    logRender('FollowListContainer')
    return (
      <FollowList
        navigator={this.props.navigator}
        users={this.props.users}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const userIDs = passedProps.userIDs
  const mainState = state.get('main')
  return {
    users: List(userIDs.map(userID => mainState.getIn(['users', userID])))
  }
}

export default connect(mapStateToProps)(FollowListContainer)
