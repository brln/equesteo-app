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
    console.log('rendering SignupLoginContainer')
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
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  const rides = mainState.get('rides').valueSeq().filter(
    (r) => r.get('userID') === userID && r.get('deleted') !== true
  ).toList()
  const horses = mainState.get('horses').valueSeq().filter(
    (r) => r.get('userID') === userID && r.get('deleted') !== true
  ).toList()
  return {
    horses,
    rides,
    user: mainState.getIn(['users', userID])
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
