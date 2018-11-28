import { Map } from 'immutable'
import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'
import React from 'react'
import { connect } from 'react-redux';
import {
  clearPausedLocations,
  stashRidePhoto,
  deleteUnpersistedRide,
  discardCurrentRide,
  mergeStashedLocations,
  removeStashedRidePhoto,
  rideUpdated,
  setPopShowRide,
  stopStashNewLocations,
} from '../actions/standard'
import {
  loadRideCoordinates,
  persistRide,
  stopLocationTracking,
} from '../actions/functional'
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
      deletedPhotoIDs: [],
      showPhotoMenu: false,
      selectedPhotoID: null
    }
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
    this.stashedRidePhotoKey = this.stashedRidePhotoKey.bind(this)
    this.allPhotos = this.allPhotos.bind(this)

    this.memoizedHorses = memoizeOne(this.horses)
    this.memoizedAllPhotos = memoizeOne(this.allPhotos)

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

  navigationButtonPressed({ buttonId }) {
    if (this.props.newRide) {
      Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
      if (buttonId === 'save') {
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          true,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs
        ))
        this.props.dispatch(setPopShowRide(this.props.ride.get('_id'), true))
        Navigation.popToRoot(this.props.componentId).then(() => {
          this.props.dispatch(clearPausedLocations())
          this.props.dispatch(stopLocationTracking())
          this.props.dispatch(discardCurrentRide())
        })
      } else if (buttonId === 'discard') {
        Navigation.popToRoot(this.props.componentId).then(() => {
          this.props.dispatch(clearPausedLocations())
          this.props.dispatch(stopLocationTracking())
          this.props.dispatch(discardCurrentRide())
          this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
        })
      } else if (buttonId === 'back') {
        Navigation.pop(this.props.componentId).then(() => {
          this.props.dispatch(stopStashNewLocations())
          this.props.dispatch(mergeStashedLocations())
        })
      }
    } else {
      if (buttonId === 'save') {
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          false,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs
        ))
        Navigation.pop(this.props.componentId)
      } else if (buttonId === 'back' || buttonId === 'discard') {
        Navigation.pop(this.props.componentId).then(() => {
          this.props.dispatch(rideUpdated(this.state.cachedRide))
        })
      }
    }
    Keyboard.dismiss()
  }

  componentDidMount () {
    if(!this.props.rideCoordinates || this.props.rideCoordinates.get('rideID') !== this.props.ride.get('_id')) {
      this.props.dispatch(loadRideCoordinates(this.props.ride.get('_id')))
    }
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
      const allPhotos = this.memoizedAllPhotos(
        this.props.ridePhotos,
        this.props.stashedRidePhotos,
        this.state.deletedPhotoIDs
      )
      for (let otherPhoto of allPhotos.valueSeq()) {
        const id = otherPhoto.get('_id')
        if (id !== photoID && this.state.deletedPhotoIDs.indexOf(id) < 0) {
          this.props.dispatch(rideUpdated(this.props.ride.set('coverPhotoID', id)))
          break
        }
      }
    }
    if (this.props.stashedRidePhotos.get(photoID)) {
      this.props.dispatch(removeStashedRidePhoto(
        photoID,
        this.stashedRidePhotoKey(),
      ))
    } else {
      this.setState({
        deletedPhotoIDs: [...this.state.deletedPhotoIDs, photoID],
      })
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

  changeCoverPhoto (coverPhotoID) {
    this.props.dispatch(rideUpdated(
      this.props.ride.set('coverPhotoID', coverPhotoID)
    ))
  }

  stashedRidePhotoKey () {
    return this.props.newRide ? 'currentRidePhotoStash' : this.props.ride.get('_id')
  }

  createPhoto (uri) {
    let ride = this.props.ride
    let timestamp = unixTimeNow()
    let _id = generateUUID()
    ride = ride.set('coverPhotoID', _id)
    this.props.dispatch(rideUpdated(ride))
    this.props.dispatch(
      stashRidePhoto(
        Map({ _id, timestamp, uri, userID: this.props.userID }),
        this.stashedRidePhotoKey()
      )
    )
  }

  horses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  allPhotos (ridePhotos, stashedRidePhotos, deletedPhotoIDs) {
    const existing = ridePhotos.filter((rp) => {
      return rp.get('rideID') === this.props.ride.get('_id')
        && rp.get('deleted') !== true
    })

    const withNew = stashedRidePhotos.valueSeq().reduce((a, stashed) => {
      return a.set(stashed.get('_id'), stashed)
    }, existing)

    return withNew.filter(rp => deletedPhotoIDs.indexOf(rp.get('_id')) < 0)
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
        rideCoordinates={this.props.rideCoordinates}
        openPhotoMenu={this.openPhotoMenu}
        ride={this.props.ride}
        ridePhotos={this.memoizedAllPhotos(
          this.props.ridePhotos,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs)
        }
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
  const ridePhotoStashIndex = newRide ? 'currentRidePhotoStash' : passedProps.rideID

  return {
    activeComponent: localState.get('activeComponent'),
    stashedRidePhotos: localState.getIn(['ridePhotoStash', ridePhotoStashIndex]) || Map(),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    newRide,
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    rideCoordinates: pouchState.get('selectedRideCoordinates'),
    ridePhotos: pouchState.get('ridePhotos'),
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(UpdateRideContainer)
