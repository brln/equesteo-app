import React, { Component } from 'react'
import { connect } from 'react-redux';

import Feed from '../components/Feed/Feed'
import {justFinishedRideShown, syncDBPull, toggleRideCarrot} from "../actions";

class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      lastFullSync: null
    }
    this.justFinishedRideShown = this.justFinishedRideShown.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.syncDBPull = this.syncDBPull.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const nextState = {}
    nextState.lastFullSync = nextProps.lastFullSync
    if (prevState.lastFullSync !== nextProps.lastFullSync) {
      nextState.refreshing = false
    }
    return nextState
  }

  syncDBPull () {
    this.setState({
      refreshing: true
    })
    this.props.dispatch(syncDBPull('all'))
  }

  justFinishedRideShown () {
    this.props.dispatch(justFinishedRideShown())
  }

  toggleCarrot (rideID) {
    this.props.dispatch(toggleRideCarrot(rideID))
  }

  render() {
    return (
      <Feed
        followingRides={this.props.followingRides}
        horses={this.props.horses}
        justFinishedRide={this.props.justFinishedRide}
        justFinishedRideShown={this.justFinishedRideShown}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots}
        syncDBPull={this.syncDBPull}
        toggleCarrot={this.toggleCarrot}
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
    lastFullSync: state.localState.lastFullSync,
    rideCarrots: state.rideCarrots,
    yourRides: state.rides.filter((r) => r.userID === state.localState.userID).sort((a, b) => b.startTime - a.startTime),
  }
}

export default connect(mapStateToProps)(FeedContainer)
