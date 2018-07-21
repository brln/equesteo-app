import React, { Component } from 'react'
import { connect } from 'react-redux';

import UpdateHorse from '../components/UpdateHorse'
import { createHorse, updateHorse } from '../actions'
import NavigatorComponent from './NavigatorComponent'

class UpdateHorseContainer extends NavigatorComponent {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      },
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      horseData: null,
    }
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.horseData || props.horseData._rev !== state.horseData._rev) {
      nextState = {
        horseData: props.horseData,
        userMadeChanges: false
      }
    }
    return nextState
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        if (this.props.newHorse) {
          this.props.dispatch(createHorse({
            ...this.state.horseData,
            _id:  `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
            userID: this.props.userID
          }))
        } else {
          this.props.dispatch(updateHorse(this.state.horseData))
        }
        this.props.navigator.pop()
      }
    }
  }

  changeHorseDetails (newDetails) {
    const newData = { ...this.state.horseData, ...newDetails }
    this.setState({
      userMadeChanges: true,
      horseData: newData
    })
  }

  render() {
    return (
      <UpdateHorse
        changeHorseDetails={this.changeHorseDetails}
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.state.horseData}
        modalOpen={this.state.modalOpen}
        navigator={this.props.navigator}
        uploadPhoto={this.uploadPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  let horseData = {
    photosByID: {}
  }
  if (passedProps.horseID) {
    for (let eachHorse of state.horses) {
      if (eachHorse._id === passedProps.horseID) {
        horseData = eachHorse
        break;
      }
    }
  }
  console.log(horseData)
  return {
    horseData,
    userID: state.localState.userID,
    newHorse: passedProps.newHorse
  }
}

export default  connect(mapStateToProps)(UpdateHorseContainer)
