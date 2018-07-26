import { Map } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux';

import { createRideComment } from '../actions'
import { unixTimeNow } from '../helpers'
import RideComments from '../components/RideComments/RideComments'
import NavigatorComponent from './NavigatorComponent'

class RideCommentsContainer extends NavigatorComponent {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'submit',
        title: 'Submit',
      }
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      newComment: null
    }
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.rideComments = this.rideComments.bind(this)
    this.updateNewComment = this.updateNewComment.bind(this)
  }

  updateNewComment (newComment) {
    this.setState({newComment})
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'submit' && !!this.state.newComment !== false) {
        this.props.dispatch(createRideComment({
          comment: this.state.newComment,
          rideID: this.props.ride.get('_id'),
          timestamp: unixTimeNow()
        }))
        this.setState({newComment: null})
      }
    }
  }

  rideComments () {
    return this.props.rideComments.valueSeq().filter(
      (rc) => rc.get('rideID') === this.props.ride.get('_id')
    ).sort(
      (a, b) => b.get('timestamp') - a.get('timestamp')
    ).toList()
  }

  render() {
    return (
      <RideComments
        navigator={this.props.navigator}
        newComment={this.state.newComment}
        rideComments={this.rideComments()}
        updateNewComment={this.updateNewComment}
        users={this.props.users}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    ride: state.getIn(['main', 'rides', passedProps.rideID]),
    rideComments: state.getIn(['main', 'rideComments']),
    users: state.getIn(['main', 'users'])
  }
}

export default  connect(mapStateToProps)(RideCommentsContainer)
