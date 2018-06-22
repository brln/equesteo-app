import React, { Component } from 'react'
import { connect } from 'react-redux';
import moment from 'moment'

import {
  changeScreen,
  discardRide,
  createRide,
  stopLocationTracking,
  uploadRidePhoto
} from '../actions'
import { generateUUID, unixTimeNow } from '../helpers'
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
    const rideName = `${props.currentRide.distance.toFixed(2)} mi ride on ${moment(props.currentRide.startTime).format('MMMM DD YYYY')}`
    this.state = {
      rideName: rideName,
      horseID: null,
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
    if (!horseID && this.props.horses.length > 0) {
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
    horses: state.horses.filter((h) => h.userID === state.localState.userID),
    goodConnection: state.localState.goodConnection,
    currentRide: state.localState.currentRide,
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(RideDetailsContainer)
