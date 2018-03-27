import React, { Component } from 'react'
import { connect } from 'react-redux';

import Feed from '../components/Feed/Feed'

class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Feed
        followingRides={this.props.followingRides}
        horses={this.props.horses}
        yourRides={this.props.yourRides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    followingRides: state.rides.filter((r) => r.userID !== state.userData.id),
    horses: state.horses,
    yourRides: state.rides.filter((r) => r.userID === state.userData.id),
  }
}

export default connect(mapStateToProps)(FeedContainer)
