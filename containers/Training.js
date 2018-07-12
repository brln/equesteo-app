import React, { Component } from 'react'
import { connect } from 'react-redux';

import { changeScreen } from '../actions'
import Training from '../components/Training/Training'
import NavigatorComponent from './NavigatorComponent'
import { FEED } from '../screens'

class TrainingContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent (event) {
    if (event.id === 'willDisappear' && event.type === 'ScreenChangedEvent') {
      this.props.dispatch(changeScreen(FEED))
    }
  }

  render() {
    return (
      <Training
        horses={this.props.horses}
        navigator={this.props.navigator}
        rides={this.props.rides}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses,
    rides: state.rides.filter((r) => r.userID === state.localState.userID && r.deleted !== true),
    user: state.users[state.localState.userID]
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
