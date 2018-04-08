import React, { Component } from 'react'
import { connect } from 'react-redux';

import Barn from '../components/Barn'
import { needsToPersist, saveHorse } from '../actions'
import { generateUUID } from '../helpers'

class BarnContainer extends Component {
  constructor (props) {
    super(props)
    this.saveNewHorse = this.saveNewHorse.bind(this)
  }

  saveNewHorse (horseData) {
    this.props.dispatch(saveHorse({
      ...horseData,
      id: generateUUID()
    }))
    this.props.dispatch(needsToPersist())
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
