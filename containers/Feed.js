import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  changeScreen,
  justFinishedRideShown,
  syncDBPull,
  toggleRideCarrot
} from "../actions";
import { logRender } from '../helpers'
import Feed from '../components/Feed/Feed'
import NavigatorComponent from './NavigatorComponent'
import { FEED, RIDE_COMMENTS } from '../screens'

class FeedContainer extends NavigatorComponent {
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

  componentDidMount () {
    this.props.dispatch(changeScreen(FEED))
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
        rideID: ride.get('_id')
      }
    })
  }

  render() {
    console.log('rendering feedContainer')
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

function followingRideFilter (state, userID) {
  const following = state.getIn(['main', 'follows']).valueSeq().filter(
    f => f.get('deleted') !== true && f.get('followerID') === userID
  ).map(
    f => f.get('followingID')
  )
  return state.getIn(['main', 'rides']).valueSeq().filter(
    r => r.get('userID') !== userID // not the users rides
      && r.get('deleted') !== true // hasn't been deleted
      && following.indexOf(r.get('userID')) >= 0 // user hasn't removed follow
  ).sort(
    (a, b) => b.get('startTime') - a.get('startTime')
  ).toList()
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  const yourRides = mainState.get('rides').valueSeq().filter(
      (r) => r.get('userID') === userID && r.get('deleted') !== true
    ).sort((a, b) => b.get('startTime') - a.get('startTime')).toList()
  return {
    followingRides: followingRideFilter(state, userID),
    horses: mainState.get('horses').toList(),
    justFinishedRide: localState.get('justFinishedRide'),
    lastFullSync: localState.get('lastFullSync'),
    rideCarrots: mainState.get('rideCarrots').toList(),
    rideComments: mainState.get('rideComments').toList(),
    users: mainState.get('users'),
    userID,
    yourRides,
  }
}

export default connect(mapStateToProps)(FeedContainer)
