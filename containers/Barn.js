import React, { Component } from 'react'
import { connect } from 'react-redux';

import Barn from '../components/Barn'
import { saveNewHorse } from '../actions'

class BarnContainer extends Component {
  constructor (props) {
    super(props)
    this.saveNewHorse = this.saveNewHorse.bind(this)
  }

  saveNewHorse (horseData) {
    this.props.dispatch(saveNewHorse(horseData))
  }

  render() {
    return (
      <Barn
        horses={this.props.horses}
        saveNewHorse={this.saveNewHorse}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    horses: state.horses
  }
}

export default  connect(mapStateToProps)(BarnContainer)
