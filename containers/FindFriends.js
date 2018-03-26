import React, { Component } from 'react'
import { connect } from 'react-redux';
import FindFriends from '../components/FindFriends'
import { searchForFriends } from "../actions"

class FindFriendsContainer extends Component {
  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
    return (
      <FindFriends
        navigator={this.props.navigator}
        search={this.search}
        userData={this.props.userData}
        userSearchResults={this.props.userSearchResults}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    userData: state.userData,
    userSearchResults: state.userSearchResults
  }
}

export default connect(mapStateToProps)(FindFriendsContainer)
