import React, { Component } from 'react'
import { connect } from 'react-redux';

import Feed from '../components/Feed/Feed'
import {justFinishedRideShown, syncDBPull} from "../actions";

class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.justFinishedRideShown = this.justFinishedRideShown.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'refresh') {
        this.props.dispatch(syncDBPull('all'))
      }
    }
  }

  justFinishedRideShown () {
    this.props.dispatch(justFinishedRideShown())
  }

  render() {
    return (
      <Feed
        followingRides={this.props.followingRides}
        justFinishedRide={this.props.justFinishedRide}
        justFinishedRideShown={this.justFinishedRideShown}
        horses={this.props.horses}
        yourRides={this.props.yourRides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    followingRides: state.rides.filter((r) => r.userID !== state.localState.userID).sort((a, b) => b.startTime - a.startTime),
    horses: state.horses,
    justFinishedRide: state.localState.justFinishedRide,
    yourRides: state.rides.filter((r) => r.userID === state.localState.userID).sort((a, b) => b.startTime - a.startTime),
  }
}

export default connect(mapStateToProps)(FeedContainer)
