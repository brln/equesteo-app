import React, { Component } from 'react'
import { connect } from 'react-redux';


import {
  changeScreen,
  discardRide,
  createRide,
  stopLocationTracking,
  updateRide,
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
    this.state = {
      ride: null,
      horseSelected: false,
      userMadeChanges: false
    }
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.createRide = this.createRide.bind(this)
    this.doneOnPage = this.doneOnPage.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.ride && props.newRide) {
      const name = newRideName(props.currentRide)
      const _id = `${props.userID.toString()}_${(new Date).getTime().toString()}`
      nextState = {
        ride: {
          _id,
          elapsedTimeSecs: props.elapsedTime,
          horseID: null,
          name,
          userID: props.userID,
          photosByID: {},
          coverPhotoID: null,
        },
        userMadeChanges: true
      }
    } else if (!state.ride) {
      nextState = {
        ride: props.currentRide
      }
    }
    return nextState
  }

  changeRideName (text) {
    this.setState({
      ...this.state,
      ride: {
        ...this.state.ride,
        name: text
      }
    })
  }

  changeHorseID (horseID) {
    this.setState({
      ...this.state,
      horseSelected: true,
      ride: {
        ...this.state.ride,
        horseID
      }
    })
  }

  doneOnPage () {
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(FEED))
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (this.props.newRide) {
        if (event.id === 'save') {
          this.createRide(this.state.ride)
        } else if (event.id === 'discard') {
          this.props.dispatch(discardRide())
          this.doneOnPage()
        }
      } else {
        if (event.id === 'save') {
          this.props.dispatch(updateRide(this.state.ride))
        }
        this.props.navigator.pop()
      }

    }
  }

  createRide () {
    this.props.dispatch(stopLocationTracking())
    for (let photoID of Object.keys(this.state.ride.photosByID)) {
      this.props.dispatch(uploadRidePhoto(photoID, this.state.ride.photosByID[photoID].uri, this.state.ride._id))
    }
    this.props.dispatch(createRide(this.state.ride))
    this.doneOnPage()
  }

  changeCoverPhoto (coverPhotoID) {
    console.log('changing: ' + coverPhotoID)
    this.setState({
      ...this.state,
      ride: {
        ...this.state.ride,
        coverPhotoID
      }
    })
  }

  uploadPhoto (photoURI) {
    const photoID = generateUUID()
    const newPhotosByID = {...this.state.ride.photosByID}
    newPhotosByID[photoID] = {uri: photoURI, timestamp: unixTimeNow()}
    this.setState({
      ...this.state,
      horseSelected: true,
      ride: {
        ...this.state.ride,
        coverPhotoID: photoID,
        photosByID: newPhotosByID
      }
    })
  }

  render() {
    return (
      <RideDetails
        changeCoverPhoto={this.changeCoverPhoto}
        coverPhotoID={this.state.ride.coverPhotoID}
        photosByID={this.state.ride.photosByID}
        horses={this.props.horses}
        horseID={this.state.ride.horseID}
        horseSelected={this.state.horseSelected}
        changeRideName={this.changeRideName}
        changeHorseID={this.changeHorseID}
        rideName={this.state.ride.name}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, ownProps) {
  const newRide = !ownProps.rideID
  let currentRide = state.localState.currentRide
  if (!newRide) {
    currentRide = state.rides.filter(r => r._id === ownProps.rideID)[0]
  }
  return {
    currentRide,
    horses: state.horses.filter((h) => h.userID === state.localState.userID && h.deleted !== true),
    newRide,
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(RideDetailsContainer)
