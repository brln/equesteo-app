import React, { Component } from 'react'
import { connect } from 'react-redux';

import Feed from '../components/Feed'

class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Feed
        rides={this.props.rides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    rides: state.rides
  }
}

export default connect(mapStateToProps)(FeedContainer)
