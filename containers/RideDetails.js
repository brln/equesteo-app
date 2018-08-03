import { Map } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux';


import {
  discardRide,
  createRide,
  stopLocationTracking,
  updateRide,
  uploadRidePhoto
} from '../actions'
import { generateUUID, logRender, newRideName, unixTimeNow } from '../helpers'
import RideDetails from '../components/RideRecorder/RideDetails'
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
      userMadeChanges: false,
      newPhotoIDs: []
    }
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changePublic = this.changePublic.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.createRide = this.createRide.bind(this)
    this.doneOnPage = this.doneOnPage.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    this.uploadNewPhotos = this.uploadNewPhotos.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.ride && props.newRide) {
      const name = newRideName(props.currentRide)
      const _id = `${props.userID.toString()}_${(new Date).getTime().toString()}`
      nextState = {
        ride: Map({
          _id,
          elapsedTimeSecs: props.elapsedTime,
          horseID: null,
          name,
          userID: props.userID,
          photosByID: Map({}),
          coverPhotoID: null,
          isPublic: props.user.get('ridesDefaultPublic')
        }),
        userMadeChanges: true
      }
    } else if (!state.ride) {
      nextState = {
        ride: props.currentRide
      }
    }
    return nextState
  }

  changePublic (newVal) {
    this.setState({
      ...this.state,
      ride: this.state.ride.set('isPublic', newVal)
    })
  }

  changeRideName (text) {
    this.setState({
      ...this.state,
      ride: this.state.ride.set('name', text)
    })
  }

  changeHorseID (horseID) {
    this.setState({
      ...this.state,
      horseSelected: true,
      ride: this.state.ride.set('horseID', horseID)
    })
  }

  doneOnPage () {
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
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
          this.uploadNewPhotos()
          this.props.dispatch(updateRide(this.state.ride))
        }
        this.props.navigator.pop()
      }
    }
  }

  uploadNewPhotos () {
    for (let photoID of this.state.newPhotoIDs) {
      console.log('uploading photo: ' + photoID)
      this.props.dispatch(
        uploadRidePhoto(
          photoID,
          this.state.ride.getIn(['photosByID', photoID, 'uri']),
          this.state.ride.get('_id')
        )
      )
    }
  }

  createRide () {
    this.props.dispatch(stopLocationTracking())
    this.uploadNewPhotos()
    this.props.dispatch(createRide(this.state.ride))
    this.doneOnPage()
  }

  changeCoverPhoto (coverPhotoID) {
    const newRide = this.state.ride.set('coverPhotoID', coverPhotoID)
    this.setState({
      ...this.state,
      ride: newRide
    })
  }

  uploadPhoto (photoURI) {
    const photoID = generateUUID()
    const newPhotosByID = this.state.ride.get(
      'photosByID'
    ).set(
      photoID,
      Map({uri: photoURI, timestamp: unixTimeNow()})
    )
    const newRide = this.state.ride.set('coverPhotoID', photoID).set('photosByID', newPhotosByID)
    this.setState({
      ...this.state,
      horseSelected: true,
      ride: newRide,
      newPhotoIDs: [...this.state.newPhotoIDs, photoID]
    })
  }

  yourHorses () {
    return this.props.horses.toList().filter(
      h => h.get('userID') === this.props.userID && h.get('deleted') !== true
    )
  }

  render() {
    logRender('rendering RideDetailsContainer')
    return (
      <RideDetails
        changeCoverPhoto={this.changeCoverPhoto}
        changeRideName={this.changeRideName}
        changeHorseID={this.changeHorseID}
        changePublic={this.changePublic}
        coverPhotoID={this.state.ride.get('coverPhotoID')}
        photosByID={this.state.ride.get('photosByID')}
        horses={this.yourHorses()}
        horseID={this.state.ride.get('horseID')}
        horseSelected={this.state.horseSelected}
        isPublic={this.state.ride.get('isPublic')}
        rideName={this.state.ride.get('name')}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const newRide = !passedProps.rideID
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  let currentRide = localState.get('currentRide')
  if (!newRide) {
    currentRide = mainState.getIn(['rides', passedProps.rideID])
  }
  return {
    currentRide,
    horses: mainState.get('horses'),
    newRide,
    userID,
    user: mainState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(RideDetailsContainer)
