import React, { Component } from 'react'
import { connect } from 'react-redux';

import { changeScreen, createHorse } from '../actions'
import Barn from '../components/Barn'
import NavigatorComponent from './NavigatorComponent'
import { HORSE } from '../screens'

class BarnContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.saveNewHorse = this.saveNewHorse.bind(this)
    this.horseProfile = this.horseProfile.bind(this)
  }

  horseProfile (horse) {
    this.props.dispatch(changeScreen(HORSE))
    this.props.navigator.push({
      screen: HORSE,
      title: horse.name,
      passProps: {horseID: horse._id},
    })
  }

  saveNewHorse (horseData) {
    this.props.dispatch(createHorse({
      ...horseData,
      _id:  `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
      userID: this.props.userID
    }))
  }

  render() {
    return (
      <Barn
        horses={this.props.horses}
        horseProfile={this.horseProfile}
        saveNewHorse={this.saveNewHorse}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    horses: state.horses.filter((h) => h.userID === state.localState.userID && h.deleted !== true),
    userID: state.localState.userID
  }
}

export default  connect(mapStateToProps)(BarnContainer)
