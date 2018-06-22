import React, { Component } from 'react'
import { connect } from 'react-redux';

import {
  changeScreen,
  uploadRidePhoto,
  updateRide,
} from '../actions'
import { generateUUID, unixTimeNow } from '../helpers'
import UpdateRide from '../components/Ride/UpdateRide'
import { FEED } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class UpdateRideContainer extends NavigatorComponent {
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      },
      {
        id: 'cancel',
        title: 'Cancel'
      },
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      ride: null,
      userMadeChanges: false
    }
    this.doneOnPage = this.doneOnPage.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.saveRide = this.saveRide.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.ride) {
      nextState = {
        ride: props.ride,
        userMadeChanges: false
      }
    }
    return nextState
  }

  changeRideName (text) {
    this.setState({
      ride: { ...this.state.ride, name: text },
      userMadeChanges: true
    })
  }

  changeHorseID (horseID) {
    this.setState({
      ride: { ...this.state.ride, horseID },
      userMadeChanges: true
    })
  }

  doneOnPage () {
    this.props.navigator.pop({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(FEED))
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.saveRide()
      } else if (event.id === 'cancel') {
        this.doneOnPage()
      }
    }
  }

  saveRide () {
    this.props.dispatch(updateRide(this.state.ride))
    this.doneOnPage()
  }

  uploadPhoto (photoURI) {
    const photoID = generateUUID()
    const newPhotosByID = {...this.state.ride.photosByID}
    newPhotosByID[photoID] = {uri: photoURI, timestamp: unixTimeNow()}
    this.props.dispatch(uploadRidePhoto(photoID, photoURI, this.state.ride._id))
    this.setState({
      ride: {
        ...this.state.ride,
        coverPhotoID: photoID,
        photosByID: newPhotosByID
      }
    })
  }

  render() {
    return (
      <UpdateRide
        changeRideName={this.changeRideName}
        changeHorseID={this.changeHorseID}
        horses={this.props.horses}
        ride={this.state.ride}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horses: state.horses.filter((h) => h.userID === state.localState.userID),
    ride: state.rides.filter((r) => r._id === passedProps.rideID)[0],
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(UpdateRideContainer)
