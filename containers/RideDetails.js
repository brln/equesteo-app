import React, { Component } from 'react'
import { connect } from 'react-redux';


import {
  changeScreen,
  discardRide,
  createRide,
  stopLocationTracking,
  uploadRidePhoto
} from '../actions'
import { generateUUID, newRideName, unixTimeNow } from '../helpers'
import RideDetails from '../components/RideRecorder/RideDetails'
import { FEED } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class RideDetailsContainer extends NavigatorComponent {
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      },
      {
        id: 'discard',
        title: 'Discard'
      },
    ],
  }

  constructor (props) {
    super(props)
    const rideName = newRideName(props.currentRide)
    this.state = {
      rideName: rideName,
      horseID: null,
      horseSelected: false,
      photosByID: {},
      coverPhotoID: null,
    }
    this.doneOnPage = this.doneOnPage.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.createRide = this.createRide.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  changeRideName (text) {
    this.setState({
      rideName: text
    })
  }

  changeHorseID (horseID) {
    this.setState({
      horseSelected: true,
      horseID: horseID
    })
  }

  doneOnPage () {
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(FEED))
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.createRide()
      } else if (event.id === 'discard') {
        this.props.dispatch(discardRide())
        this.doneOnPage()
      }
    }
  }

  createRide () {
    this.props.dispatch(stopLocationTracking())
    let horseID = this.state.horseID
    if (!this.state.horseSelected && this.props.horses.length > 0) {
      horseID = this.props.horses[0]._id
    }
    const rideID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
    for (let photoID of Object.keys(this.state.photosByID)) {
      this.props.dispatch(uploadRidePhoto(photoID, this.state.photosByID[photoID].uri, rideID))
    }
    this.props.dispatch(createRide({
      _id: rideID,
      elapsedTimeSecs: this.props.elapsedTime,
      name: this.state.rideName,
      horseID: horseID,
      userID: this.props.userID,
      photosByID: this.state.photosByID,
      coverPhotoID: this.state.coverPhotoID,
    }))
    this.doneOnPage()
  }

  uploadPhoto (photoURI) {
    const photoID = generateUUID()
    const newPhotosByID = {...this.state.photosByID}
    newPhotosByID[photoID] = {uri: photoURI, timestamp: unixTimeNow()}
    this.setState({
      coverPhotoID: photoID,
      photosByID: newPhotosByID
    })
  }

  render() {
    return (
      <RideDetails
        coverPhotoID={this.state.coverPhotoID}
        photosByID={this.state.photosByID}
        horses={this.props.horses}
        horseID={this.state.horseID}
        horseSelected={this.state.horseSelected}
        changeRideName={this.changeRideName}
        changeHorseID={this.changeHorseID}
        rideName={this.state.rideName}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, ownProps) {
  return {
    horses: state.horses.filter((h) => h.userID === state.localState.userID && h.deleted !== true),
    goodConnection: state.localState.goodConnection,
    currentRide: state.localState.currentRide,
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(RideDetailsContainer)
