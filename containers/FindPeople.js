import React, { Component } from 'react'
import { connect } from 'react-redux';

import { searchForFriends } from "../actions"
import { logRender } from '../helpers'
import FindPeople from '../components/FindPeople'
import NavigatorComponent from './NavigatorComponent'

class FindPeopleContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
    logRender('FindPeopleContainer')
    return (
      <FindPeople
        allUsers={this.props.allUsers}
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
    allUsers: mainState.get('users'),
    user: mainState.getIn(['users', localState.get('userID')]),
    userSearchResults: localState.get('userSearchResults')
  }
}

export default connect(mapStateToProps)(FindPeopleContainer)
