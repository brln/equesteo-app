import React, { Component } from 'react'
import { connect } from 'react-redux';

import { changeScreen, searchForFriends } from "../actions"
import Following from '../components/Following'
import NavigatorComponent from './NavigatorComponent'
import { FEED } from '../screens'

class FollowingContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent (event) {
    if (event.id === 'willDisappear' && event.type === 'ScreenChangedEvent') {
      this.props.dispatch(changeScreen(FEED))
    }
  }

  shouldComponentUpdate (nextProps) {
    return !!nextProps.user
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
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
  return {
    user: state.users[state.localState.userID],
    userSearchResults: state.localState.userSearchResults
  }
}

export default connect(mapStateToProps)(FollowingContainer)
