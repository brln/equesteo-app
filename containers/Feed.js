import React, { Component } from 'react'
import { connect } from 'react-redux';

import Feed from '../components/Feed/Feed'
import { justFinishedRideShown, syncDBPull, toggleRideCarrot, updateRide } from "../actions";
import { RIDE_COMMENTS } from '../screens'

class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      lastFullSync: null
    }
    this.justFinishedRideShown = this.justFinishedRideShown.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.showComments = this.showComments.bind(this)
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

  showComments (ride) {
    this.props.navigator.push({
      screen: RIDE_COMMENTS,
      title: 'Comments',
      passProps: {
        rideID: ride._id
      }
    })
  }

  render() {
    return (
      <Feed
        deleteRide={this.deleteRide}
        followingRides={this.props.followingRides}
        horses={this.props.horses}
        justFinishedRide={this.props.justFinishedRide}
        justFinishedRideShown={this.justFinishedRideShown}
        navigator={this.props.navigator}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots}
        rideComments={this.props.rideComments}
        showComments={this.showComments}
        syncDBPull={this.syncDBPull}
        toggleCarrot={this.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
        yourRides={this.props.yourRides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    followingRides: state.rides.filter((r) => r.userID !== state.localState.userID && r.deleted !== true).sort((a, b) => b.startTime - a.startTime),
    horses: state.horses,
    justFinishedRide: state.localState.justFinishedRide,
    lastFullSync: state.localState.lastFullSync,
    rideCarrots: state.rideCarrots,
    rideComments: state.rideComments,
    users: state.users,
    userID: state.localState.userID,
    yourRides: state.rides.filter((r) => r.userID === state.localState.userID && r.deleted !== true).sort((a, b) => b.startTime - a.startTime),
  }
}

export default connect(mapStateToProps)(FeedContainer)
