import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  justFinishedRideShown,
  syncDBPull,
  toggleRideCarrot
} from "../actions";
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
    this.filteredHorses = this.filteredHorses.bind(this)
    this.followIDs = this.followIDs.bind(this)
    this.followingRides = this.followingRides.bind(this)
    this.justFinishedRideShown = this.justFinishedRideShown.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.showComments = this.showComments.bind(this)
    this.syncDBPull = this.syncDBPull.bind(this)
    this.yourRides = this.yourRides.bind(this)
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

  yourRides () {
    return this.props.rides.valueSeq().filter(
      (r) => r.get('userID') === this.props.userID && r.get('deleted') !== true
    ).sort((a, b) =>
      b.get('startTime') - a.get('startTime')
    ).toList()
  }

  followIDs () {
    return this.props.follows.valueSeq().filter(
      f => f.get('deleted') !== true && f.get('followerID') === this.props.userID
    ).map(
      f => f.get('followingID')
    ).toList()
  }

  followingRides () {
    return this.props.rides.valueSeq().filter(
      r => r.get('userID') !== this.props.userID // not the users rides
        && r.get('isPublic') === true // is a public ride @TODO: filter this when replicating
        && r.get('deleted') !== true // hasn't been deleted
        && this.followIDs().indexOf(r.get('userID')) >= 0 // user hasn't removed follow
    ).sort(
      (a, b) => b.get('startTime') - a.get('startTime')
    ).toList()
  }

  filteredHorses () {
    return this.props.horses.valueSeq().filter(h => {
      return this.followIDs().indexOf(h.get('userID')) >= 0 || h.get('userID') === this.props.userID
    }).toList()
  }

  render() {
    console.log('rendering feedContainer')
    return (
      <Feed
        deleteRide={this.deleteRide}
        followingRides={this.followingRides()}
        horses={this.filteredHorses()}
        justFinishedRide={this.props.justFinishedRide}
        justFinishedRideShown={this.justFinishedRideShown}
        navigator={this.props.navigator}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots.toList()}
        rideComments={this.props.rideComments.toList()}
        showComments={this.showComments}
        syncDBPull={this.syncDBPull}
        toggleCarrot={this.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
        yourRides={this.yourRides()}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  return {
    follows: mainState.get('follows'),
    horses: mainState.get('horses'),
    justFinishedRide: localState.get('justFinishedRide'),
    lastFullSync: localState.get('lastFullSync'),
    rides: mainState.get('rides'),
    rideCarrots: mainState.get('rideCarrots'),
    rideComments: mainState.get('rideComments'),
    users: mainState.get('users'),
    userID,
  }
}

export default connect(mapStateToProps)(FeedContainer)
