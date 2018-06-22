import React, { Component } from 'react'
import { connect } from 'react-redux';

import Training from '../components/Training/Training'
import NavigatorComponent from './NavigatorComponent'

class TrainingContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <Training
        horses={this.props.horses}
        navigator={this.props.navigator}
        rides={this.props.rides}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses,
    rides: state.rides.filter((r) => r.userID === state.localState.userID && r.deleted !== true),
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
