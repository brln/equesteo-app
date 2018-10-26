import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';


import {
  clearPausedLocations,
  createRide,
  discardRide,
  mergeStashedLocations,
  stashNewLocations,
  stopLocationTracking,
  stopStashNewLocations,
  updateRide,
  uploadRidePhoto
} from '../actions'
import { brand } from '../colors'
import { generateUUID, logRender, newRideName, unixTimeNow } from '../helpers'
import RideDetails from '../components/RideRecorder/RideDetails'

class RideDetailsContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
            color: 'white'
          },
          {
            id: 'discard',
            text: 'Discard',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
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
    this.changeRideNotes = this.changeRideNotes.bind(this)
    this.createRide = this.createRide.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.doneOnPage = this.doneOnPage.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
    this.horses = this.horses.bind(this)
    this.uploadNewPhotos = this.uploadNewPhotos.bind(this)

    this.memoizedHorses = memoizeOne(this.horses)

    Navigation.events().bindComponent(this);

    if (props.newRide) {
      props.dispatch(stashNewLocations())
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (this.props.newRide) {
      Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
      if (buttonId === 'save') {
        this.props.dispatch(clearPausedLocations())
        this.props.dispatch(stopLocationTracking())
        this.createRide(this.state.ride)
      } else if (buttonId === 'discard') {
        this.props.dispatch(clearPausedLocations())
        this.props.dispatch(stopLocationTracking())
        this.props.dispatch(discardRide())
        this.doneOnPage()
      } else if (buttonId === 'back') {
        this.props.dispatch(stopStashNewLocations())
        this.props.dispatch(mergeStashedLocations())
        Navigation.pop(this.props.componentId)
      }
    } else {
      if (buttonId === 'save') {
        this.uploadNewPhotos()
        this.props.dispatch(updateRide(this.state.ride))
      }
      Navigation.pop(this.props.componentId)
    }
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.ride && props.newRide) {
      const name = newRideName(props.currentRide)
      const _id = `${props.userID.toString()}_${(new Date).getTime().toString()}`

      let defaultID = null
      props.horseUsers.valueSeq().forEach((hu) => {
        if (hu.get('rideDefault')) {
          defaultID = hu.get('horseID')
        }
      })

      nextState = {
        ride: Map({
          _id,
          elapsedTimeSecs: props.elapsedTime,
          horseID: defaultID,
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

  deletePhoto (photoID) {
    const newPhotos = this.state.ride.get('photosByID').delete(photoID)
    let newDeets = Map({
      photosByID: newPhotos
    })
    if (photoID === this.state.ride.get('coverPhotoID')) {
      newDeets = newDeets.set('coverPhotoID', null)
    }
    this.setState({
      ride: this.state.ride.merge(newDeets),
      userMadeChanges: true,
    })
  }

  changePublic () {
    this.setState({
      ...this.state,
      ride: this.state.ride.set('isPublic', !this.state.ride.get('isPublic'))
    })
  }

  changeRideName (text) {
    this.setState({
      ...this.state,
      ride: this.state.ride.set('name', text)
    })
  }

  changeRideNotes (notes) {
    this.setState({
      ...this.state,
      ride: this.state.ride.set('notes', notes)
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
    Navigation.popToRoot(this.props.componentId)
  }

  uploadNewPhotos () {
    for (let photoID of this.state.newPhotoIDs) {
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

  horses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  render() {
    logRender('rendering RideDetailsContainer')
    return (
      <RideDetails
        changeCoverPhoto={this.changeCoverPhoto}
        changeRideName={this.changeRideName}
        changeRideNotes={this.changeRideNotes}
        changeHorseID={this.changeHorseID}
        changePublic={this.changePublic}
        deletePhoto={this.deletePhoto}
        horses={this.memoizedHorses()}
        horseSelected={this.state.horseSelected}
        ride={this.state.ride}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const newRide = !passedProps.rideID
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')
  let currentRide = state.get('currentRide')
  if (!newRide) {
    currentRide = pouchState.getIn(['rides', passedProps.rideID])
  }
  return {
    currentRide,
    horses: pouchState.get('horses'),
    horseUsers: pouchState.get('horseUsers'),
    newRide,
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(RideDetailsContainer)
