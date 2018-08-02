import React, { Component } from 'react'
import { connect } from 'react-redux';

import { searchForFriends } from "../actions"
import { logRender } from '../helpers'
import Following from '../components/Following'
import NavigatorComponent from './NavigatorComponent'

class FollowingContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
    logRender('FollowingContainer')
    return (
      <Following
        navigator={this.props.navigator}
        search={this.search}
        user={this.props.user}
        userSearchResults={this.props.userSearchResults}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    user: mainState.getIn(['users', localState.get('userID')]),
    userSearchResults: localState.get('userSearchResults')
  }
}

export default connect(mapStateToProps)(FollowingContainer)
