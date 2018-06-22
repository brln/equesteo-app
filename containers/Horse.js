import React, { Component } from 'react'
import { connect } from 'react-redux';

import Horse from '../components/Horse'
import { changeScreen, updateHorse, uploadHorsePhoto } from '../actions'
import { FEED } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class HorseContainer extends NavigatorComponent {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      }
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      horseData: null,
    }
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
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
        this.props.dispatch(updateHorse(this.state.horseData))
        this.props.navigator.popToRoot({animated: false, animationType: 'none'})
        this.props.dispatch(changeScreen(FEED))
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

  uploadPhoto (location) {
    this.props.dispatch(uploadHorsePhoto(location, this.props.horseID))
  }

  render() {
    return (
      <Horse
        changeHorseDetails={this.changeHorseDetails}
        horse={this.state.horseData}
        navigator={this.props.navigator}
        uploadPhoto={this.uploadPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  let horseData = null
  for (let eachHorse of state.horses) {
    if (eachHorse._id === passedProps.horseID) {
      horseData = eachHorse
      break;
    }
  }
  return {
    horseData,
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(HorseContainer)
