import React, { Component } from 'react'
import { connect } from 'react-redux';

import { createRideComment } from '../actions'
import { unixTimeNow } from '../helpers'
import RideComments from '../components/RideComments'
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
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    this.updateNewComment = this.updateNewComment.bind(this)
  }

  updateNewComment (newComment) {
    this.setState({newComment})
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'submit') {
        this.props.dispatch(createRideComment({
          comment: this.state.newComment,
          rideID: this.props.ride._id,
          timestamp: unixTimeNow()
        }))
        this.setState({newComment: null})
      }
    }
  }

  render() {
    return (
      <RideComments
        navigator={this.props.navigator}
        newComment={this.state.newComment}
        rideComments={this.props.rideComments}
        updateNewComment={this.updateNewComment}
        users={this.props.users}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    ride: state.rides.filter((r) => r._id === passedProps.rideID)[0],
    rideComments: state.rideComments.filter((rc) => rc.rideID === passedProps.rideID),
    users: state.users
  }
}

export default  connect(mapStateToProps)(RideCommentsContainer)
