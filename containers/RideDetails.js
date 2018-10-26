import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';


import {
  clearPausedLocations,
  deleteUnpersistedRide,
  discardCurrentRide,
  mergeStashedLocations,
  persistRide,
  rideUpdated,
  setPopShowRide,
  stopLocationTracking,
  stopStashNewLocations,
  uploadRidePhoto
} from '../actions'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
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
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      cachedRide: null,
      newPhotoIDs: []
    }
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changePublic = this.changePublic.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.changeRideNotes = this.changeRideNotes.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.persistRide = this.persistRide.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
    this.horses = this.horses.bind(this)
    this.uploadNewPhotos = this.uploadNewPhotos.bind(this)

    this.memoizedHorses = memoizeOne(this.horses)

    Navigation.events().bindComponent(this);

    if (props.newRide) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
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
        }
      })
    } else {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'save',
              text: 'Save',
              color: 'white'
            },
          ]
        }
      })
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (!state.cachedRide && props.ride) {
      return {
        ...state,
        cachedRide: props.ride
      }
    }
    return state
  }

  navigationButtonPressed({ buttonId }) {
    if (this.props.newRide) {
      Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
      if (buttonId === 'save') {
        this.props.dispatch(discardCurrentRide())
        this.persistRide(this.props.ride.get('_id'))
        this.props.dispatch(clearPausedLocations())
        this.props.dispatch(stopLocationTracking())
        Navigation.popToRoot(this.props.componentId)
        this.props.dispatch(setPopShowRide(this.props.ride.get('_id'), true))
      } else if (buttonId === 'discard') {
        this.props.dispatch(clearPausedLocations())
        this.props.dispatch(stopLocationTracking())
        this.props.dispatch(discardCurrentRide())
        this.props.dispatch(deleteUnpersistedRide())
        Navigation.popToRoot(this.props.componentId)
      } else if (buttonId === 'back') {
        this.props.dispatch(stopStashNewLocations())
        this.props.dispatch(mergeStashedLocations())
        Navigation.pop(this.props.componentId)
      }
    } else {
      if (buttonId === 'save') {
        this.persistRide(this.props.ride.get('_id'))
        Navigation.pop(this.props.componentId)
      } else if (buttonId === 'back' || buttonId === 'discard') {
        this.props.dispatch(rideUpdated(this.state.cachedRide))
        Navigation.pop(this.props.componentId)
      }
    }
    Keyboard.dismiss()
  }

  deletePhoto (photoID) {
    const newPhotos = this.props.ride.get('photosByID').delete(photoID)
    let newDeets = Map({
      photosByID: newPhotos
    })
    if (photoID === this.props.ride.get('coverPhotoID')) {
      newDeets = newDeets.set('coverPhotoID', null)
    }
    this.props.dispatch(rideUpdated(this.props.ride.merge(newDeets)))
  }

  changePublic () {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('isPublic', !this.props.ride.get('isPublic'))
    ))
  }

  changeRideName (text) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('name', text)
    ))
  }

  changeRideNotes (notes) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('notes', notes)
    ))
  }

  changeHorseID (horseID) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('horseID', horseID)
    ))
  }

  uploadNewPhotos () {
    for (let photoID of this.state.newPhotoIDs) {
      this.props.dispatch(
        uploadRidePhoto(
          photoID,
          this.props.ride.getIn(['photosByID', photoID, 'uri']),
          this.props.ride.get('_id')
        )
      )
    }
  }

  persistRide () {
    this.props.dispatch(persistRide(this.props.ride.get('_id')))
    this.uploadNewPhotos()
  }

  changeCoverPhoto (coverPhotoID) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('coverPhotoID', coverPhotoID)
    ))
  }

  uploadPhoto (photoURI) {
    const photoID = generateUUID()
    const newPhotosByID = this.props.ride.get(
      'photosByID'
    ).set(
      photoID,
      Map({uri: photoURI, timestamp: unixTimeNow()})
    )
    const newRide = this.props.ride.set('coverPhotoID', photoID).set('photosByID', newPhotosByID)
    this.props.dispatch(rideUpdated(
      newRide
    ))
    this.setState({
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
        ride={this.props.ride}
        uploadPhoto={this.uploadPhoto}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const newRide = passedProps.newRide
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')

  return {
    horses: pouchState.get('horses'),
    horseUsers: pouchState.get('horseUsers'),
    newRide,
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(RideDetailsContainer)
