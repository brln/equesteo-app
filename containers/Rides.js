import React, { Component } from 'react'
import { connect } from 'react-redux';

import Rides from '../components/Rides'

class RidesContainer extends Component {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <Rides
        horses={this.props.horses}
        rides={this.props.rides}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    rides: state.rides,
    horses: state.horses,
  }
}

export default  connect(mapStateToProps)(RidesContainer)
