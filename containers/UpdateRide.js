import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'
import React from 'react'
import { connect } from 'react-redux';
import {
  clearPausedLocations,
  createRidePhoto,
  deleteUnpersistedRide,
  deleteUnpersistedPhoto,
  discardCurrentRide,
  mergeStashedLocations,
  persistRide,
  persistRideCoordinates,
  persistRidePhoto,
  ridePhotoUpdated,
  rideUpdated,
  setPopShowRide,
  stopLocationTracking,
  stopStashNewLocations,
  uploadRidePhoto
} from '../actions'
import BackgroundComponent from '../components/BackgroundComponent'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import UpdateRide from '../components/UpdateRide/UpdateRide'

class UpdateRideContainer extends BackgroundComponent {
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
      newPhotoIDs: [],
      deletedPhotoIDs: [],
      showPhotoMenu: false,
      selectedPhotoID: null
    }
    this.actuallyDeletePhotos = this.actuallyDeletePhotos.bind(this)
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changePublic = this.changePublic.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.changeRideNotes = this.changeRideNotes.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.createPhoto = this.createPhoto.bind(this)
    this.horses = this.horses.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.persistRide = this.persistRide.bind(this)
    this.thisRidesPhotos = this.thisRidesPhotos.bind(this)
    this.uploadNewPhotos = this.uploadNewPhotos.bind(this)

    this.memoizedHorses = memoizeOne(this.horses)
    this.memoThisRidesPhotos = memoizeOne(this.thisRidesPhotos)

    Navigation.events().bindComponent(this);
    this.setTopbarButtons(props)
  }

  setTopbarButtons (props) {
    if (props.newRide) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
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
        }
      })
    } else {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
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

  async navigationButtonPressed({ buttonId }) {
    if (this.props.newRide) {
      Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
      if (buttonId === 'save') {
        this.props.dispatch(discardCurrentRide())
        this.actuallyDeletePhotos()
        await this.persistRide()
        this.props.dispatch(setPopShowRide(this.props.ride.get('_id'), true))
        this.props.dispatch(clearPausedLocations())
        this.props.dispatch(stopLocationTracking())
        Navigation.popToRoot(this.props.componentId)
      } else if (buttonId === 'discard') {
        Navigation.popToRoot(this.props.componentId).then(() => {
          this.props.dispatch(clearPausedLocations())
          this.props.dispatch(stopLocationTracking())
          this.props.dispatch(discardCurrentRide())
          this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
        })
      } else if (buttonId === 'back') {
        this.props.dispatch(stopStashNewLocations())
        this.props.dispatch(mergeStashedLocations())
        Navigation.pop(this.props.componentId)
      }
    } else {
      if (buttonId === 'save') {
        this.persistRide(this.props.ride.get('_id'))
        this.actuallyDeletePhotos()
        Navigation.pop(this.props.componentId)
      } else if (buttonId === 'back' || buttonId === 'discard') {
        this.props.dispatch(rideUpdated(this.state.cachedRide))
        Navigation.pop(this.props.componentId)
      }
    }
    Keyboard.dismiss()
  }

  openPhotoMenu (coverPhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: coverPhotoID
    })
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [],
        leftButtons: [],
      }
    })
  }

  clearPhotoMenu () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
    this.setTopbarButtons(this.props)
  }

  markPhotoDeleted (photoID) {
    if (photoID === this.props.ride.get('coverPhotoID')) {
      const allPhotos = this.memoThisRidesPhotos(this.props.ridePhotos, this.state.deletedPhotoIDs)
      for (let otherPhoto of allPhotos.valueSeq()) {
        const id = otherPhoto.get('_id')
        if (id !== photoID && this.state.deletedPhotoIDs.indexOf(id) < 0) {
          this.props.dispatch(rideUpdated(this.props.ride.set('coverPhotoID', id)))
          break
        }
      }
    }
    this.setState({
      deletedPhotoIDs: [...this.state.deletedPhotoIDs, photoID],
    })
  }

  actuallyDeletePhotos () {
    for (let photoID of this.state.deletedPhotoIDs) {
      if (this.state.newPhotoIDs.indexOf(photoID) < 0) {
        const deleted = this.props.ridePhotos.get(photoID).set('deleted', true)
        this.props.dispatch(ridePhotoUpdated(deleted))
        this.props.dispatch(persistRidePhoto(deleted.get('_id')))
      } else {
        this.props.dispatch(deleteUnpersistedPhoto('ridePhotos', photoID))
      }
    }
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

  async uploadNewPhotos () {
    for (let photoID of this.state.newPhotoIDs) {
      if (this.state.deletedPhotoIDs.indexOf(photoID) < 0) {
        await this.props.dispatch(persistRidePhoto(photoID))
        this.props.dispatch(
          uploadRidePhoto(
            photoID,
            this.props.ridePhotos.getIn([photoID, 'uri']),
            this.props.ride.get('_id')
          )
        )
      }
    }
  }

  async persistRide () {
    await this.props.dispatch(persistRide(this.props.ride.get('_id')))
    if (this.props.newRide) {
      await this.props.dispatch(persistRideCoordinates())
    }
    await this.uploadNewPhotos()
  }

  changeCoverPhoto (coverPhotoID) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('coverPhotoID', coverPhotoID)
    ))
  }

  createPhoto (uri) {
    let ride = this.props.ride
    let timestamp = unixTimeNow()
    let _id = generateUUID()
    ride = ride.set('coverPhotoID', _id)
    this.props.dispatch(rideUpdated(ride))
    this.props.dispatch(
      createRidePhoto(
        ride.get('_id'),
        this.props.userID,
        { _id, timestamp, uri }
      )
    )
    this.setState({
      newPhotoIDs: [...this.state.newPhotoIDs, _id]
    })
  }

  horses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  thisRidesPhotos (ridePhotos, deletedPhotoIDs) {
    return ridePhotos.filter((rp) => {
      return rp.get('rideID') === this.props.ride.get('_id')
        && rp.get('deleted') !== true
        && deletedPhotoIDs.indexOf(rp.get('_id')) < 0
    })
  }

  render() {
    logRender('rendering UpdateRideContainer')
    return (
      <UpdateRide
        changeCoverPhoto={this.changeCoverPhoto}
        changeRideName={this.changeRideName}
        changeRideNotes={this.changeRideNotes}
        changeHorseID={this.changeHorseID}
        changePublic={this.changePublic}
        clearPhotoMenu={this.clearPhotoMenu}
        createPhoto={this.createPhoto}
        horses={this.memoizedHorses()}
        horsePhotos={this.props.horsePhotos}
        markPhotoDeleted={this.markPhotoDeleted}
        openPhotoMenu={this.openPhotoMenu}
        ride={this.props.ride}
        ridePhotos={this.memoThisRidesPhotos(this.props.ridePhotos, this.state.deletedPhotoIDs)}
        selectedPhotoID={this.state.selectedPhotoID}
        showPhotoMenu={this.state.showPhotoMenu}
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
    activeComponent: localState.get('activeComponent'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    newRide,
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    ridePhotos: pouchState.get('ridePhotos'),
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(UpdateRideContainer)
