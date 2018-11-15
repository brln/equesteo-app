import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'

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
          fontSize: 20
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
        background: {
          color: brand,
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
    }

    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'back') {
      Navigation.pop(this.props.componentId)
    }
    Keyboard.dismiss()
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

  render() {
    return (
      <RideComments
        newComment={this.state.newComment}
        rideComments={this.memoRideComments(this.props.rideComments)}
        submitComment={this.submitComment}
        updateNewComment={this.updateNewComment}
        users={this.props.users}
        userPhotos={this.props.userPhotos}
      />
    )
  }
}

