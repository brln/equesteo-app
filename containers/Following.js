import React, { Component } from 'react'
import { connect } from 'react-redux';
import Following from '../components/Following'
import { searchForFriends } from "../actions"

class FollowingContainer extends Component {
  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
    return (
      <Following
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
    userData: state.users.filter((u) => u._id === state.localState.userID)[0],
    userSearchResults: state.localState.userSearchResults
  }
}

export default connect(mapStateToProps)(FollowingContainer)
