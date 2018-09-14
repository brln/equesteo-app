import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { createRideComment } from '../actions'
import { brand } from '../colors'
import { unixTimeNow } from '../helpers'
import RideComments from '../components/RideComments/RideComments'

class RideCommentsContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Comments",
          color: 'white',
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      newComment: null
    }

    this.submitComment = this.submitComment.bind(this)
    this.updateNewComment = this.updateNewComment.bind(this)
    this.memoRideComments = memoizeOne(this.rideComments)
  }

  updateNewComment (newComment) {
    this.setState({newComment})
    if (newComment.slice(-1) === '\n') {
      this.submitComment()
    }
  }

  submitComment () {
    if (!!this.state.newComment === true) {
      this.props.dispatch(createRideComment({
        comment: this.state.newComment,
        rideID: this.props.ride.get('_id'),
        timestamp: unixTimeNow()
      }))
      this.setState({newComment: null})
    }
  }

  rideComments (rideComments) {
    return rideComments.valueSeq().filter(
      (rc) => rc.get('rideID') === this.props.ride.get('_id')
    ).sort(
      (a, b) => a.get('timestamp') - b.get('timestamp')
    ).toList()
  }

  render() {
    return (
      <RideComments
        newComment={this.state.newComment}
        rideComments={this.memoRideComments(this.props.rideComments)}
        submitComment={this.submitComment}
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
