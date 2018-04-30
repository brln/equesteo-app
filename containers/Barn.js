import React, { Component } from 'react'
import { connect } from 'react-redux';

import Barn from '../components/Barn'
import { saveHorse } from '../actions'

class BarnContainer extends Component {
  constructor (props) {
    super(props)
    this.saveNewHorse = this.saveNewHorse.bind(this)
  }

  saveNewHorse (horseData) {
    this.props.dispatch(saveHorse({
      ...horseData,
      _id:  `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
      userID: this.props.userID
    }))
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
    horses: state.horses.filter((h) => h.userID === state.localState.userID),
    userID: state.localState.userID
  }
}

export default  connect(mapStateToProps)(BarnContainer)
