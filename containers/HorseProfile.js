import React, { Component } from 'react'
import { connect } from 'react-redux';

import HorseProfile from '../components/HorseProfile'
import NavigatorComponent from './NavigatorComponent'

class HorseProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <HorseProfile
        horse={this.props.horse}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horse: passedProps.horse,
    user: passedProps.user,
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
