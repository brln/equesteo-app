import React, { Component } from 'react'
import { connect } from 'react-redux';

import Rides from '../components/Rides'

class RidesContainer extends Component {
  constructor (props) {
    super(props)
  }

  render() {
    return <Rides />
  }
}

function mapStateToProps (state) {
  return state
}

export default  connect(mapStateToProps)(RidesContainer)
