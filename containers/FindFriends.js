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
        userSearchResults={this.props.userSearchResults}
        search={this.search}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    userSearchResults: state.userSearchResults
  }
}

export default connect(mapStateToProps)(FindFriendsContainer)
