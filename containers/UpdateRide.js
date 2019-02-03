import { fromJS, Map } from 'immutable'
import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'
import React from 'react'
import { connect } from 'react-redux';
import {
  clearRidePhotoStash,
  clearPausedLocations,
  deleteUnpersistedRide,
  discardCurrentRide,
  mergeStashedLocations,
  removeStashedRidePhoto,
  rideCoordinatesLoaded,
  rideElevationsLoaded,
  rideHorseUpdated,
  rideUpdated,
  setPopShowRide,
  stopStashNewLocations,
  stashRidePhoto,
} from '../actions/standard'
import {
  loadRideCoordinates,
  persistRide,
  stopLocationTracking,
} from '../actions/functional'
import BackgroundComponent from '../components/BackgroundComponent'
import { brand } from '../colors'
import {
  coordSplice,
  elapsedTime,
  feetToMeters,
  generateUUID,
  haversine,
  logRender,
  parseRideCoordinate,
  parseElevationData,
  staticMap,
  unixTimeNow
} from '../helpers'
import UpdateRide from '../components/UpdateRide/UpdateRide'

class UpdateRideContainer extends BackgroundComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
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
      discardModalOpen: false,
      showPhotoMenu: false,
      showSelectHorseMenu: false,
      selectedHorseID: null,
      selectedPhotoID: null,
      trimValues: null,
    }
    this.allPhotos = this.allPhotos.bind(this)
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changePublic = this.changePublic.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.changeRideNotes = this.changeRideNotes.bind(this)
    this.clearMenus = this.clearMenus.bind(this)
    this.createPhoto = this.createPhoto.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.horses = this.horses.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.openSelectHorseMenu = this.openSelectHorseMenu.bind(this)
    this.rideHorses = this.rideHorses.bind(this)
    this.selectHorse = this.selectHorse.bind(this)
    this.setDiscardModalOpen = this.setDiscardModalOpen.bind(this)
    this.stashedRidePhotoKey = this.stashedRidePhotoKey.bind(this)
    this.trimRide = this.trimRide.bind(this)
    this.unselectHorse = this.unselectHorse.bind(this)
    this.updateLocalRideCoords = this.updateLocalRideCoords.bind(this)

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
      if (buttonId === 'save') {
        Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
        this.updateLocalRideCoords()
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          true,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs,
          this.state.trimValues,
          this.rideHorses(),
        ))
        this.props.dispatch(setPopShowRide(this.props.ride.get('_id'), true, false))
        Navigation.popToRoot(this.props.componentId).then(() => {
          this.props.dispatch(clearPausedLocations())
          this.props.dispatch(stopLocationTracking())
          this.props.dispatch(discardCurrentRide())
        })
      } else if (buttonId === 'discard') {
        this.setDiscardModalOpen(true)
      } else if (buttonId === 'back') {
        Navigation.pop(this.props.componentId).then(() => {
          this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
          this.props.dispatch(stopStashNewLocations())
          this.props.dispatch(mergeStashedLocations())
        })
      }
    } else {
      if (buttonId === 'save') {
        this.updateLocalRideCoords()
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          false,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs,
          this.state.trimValues,
          this.rideHorses(),
        ))
        Navigation.pop(this.props.componentId)
      } else if (buttonId === 'back' || buttonId === 'discard') {
        Navigation.pop(this.props.componentId).then(() => {
          this.props.dispatch(rideUpdated(this.state.cachedRide))
          this.props.dispatch(clearRidePhotoStash(this.stashedRidePhotoKey()))
        })
      }
    }
    Keyboard.dismiss()
  }

  setDiscardModalOpen (open) {
    this.setState({
      discardModalOpen: open
    })
  }

  discardRide () {
    this.props.dispatch(clearPausedLocations())
    this.props.dispatch(clearRidePhotoStash(this.stashedRidePhotoKey()))
    this.props.dispatch(stopLocationTracking())
    this.props.dispatch(discardCurrentRide())
    this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
    Navigation.popToRoot(this.props.componentId)
  }


  updateLocalRideCoords () {
    if (this.state.trimValues) {
      const rideCoords = this.props.rideCoordinates.get('rideCoordinates').toJS()
      const spliced = coordSplice(rideCoords, this.state.trimValues)
      const updatedCoords = this.props.rideCoordinates.set('rideCoordinates', fromJS(spliced))
      this.props.dispatch(rideCoordinatesLoaded(updatedCoords))

      const justCoords = updatedCoords.get('rideCoordinates')
      const firstCoord = parseRideCoordinate(justCoords.first())
      const lastCoord = parseRideCoordinate(justCoords.get(justCoords.count() - 1))
      // @TODO: if you pause the ride then remove the portion where it was paused, it will still reduce the
      // @TODO: ride time by that number. someday when you have time, you'll need to record the timestamp of all
      // @TODO: pauses and factor that into trimming. urgh.

      const newTime = elapsedTime(
        new Date(firstCoord.get('timestamp')),
        new Date(lastCoord.get('timestamp')),
        this.props.ride.get('pausedTime') || 0,
        null
      )

      const newDistance = justCoords.reduce((accum, coord) => {
        const c = parseRideCoordinate(coord)
        if (accum.lastCoord) {
          accum.total += haversine(
            accum.lastCoord.get('latitude'),
            accum.lastCoord.get('longitude'),
            c.get('latitude'),
            c.get('longitude')
          )
        }
        accum.lastCoord = c
        return accum
      }, {total: 0, lastCoord: null}).total

      const newElevationData = parseElevationData(
        updatedCoords.get('rideCoordinates'),
        this.props.rideElevations.get('elevations')
      )
      const newTotalGain = feetToMeters(newElevationData[newElevationData.length - 1].gain)
      const updatedElevation = this.props.rideElevations.set('elevationGain', newTotalGain)
      this.props.dispatch(rideElevationsLoaded(updatedElevation))

      const updatedRide = this.props.ride.set(
        'mapURL', staticMap(this.props.ride, updatedCoords.get('rideCoordinates'))
      ).set(
        'elapsedTimeSecs', newTime
      ).set(
        'distance', newDistance
      )

      this.props.dispatch(rideUpdated(updatedRide))
    }
  }

  componentDidMount () {
    if(!this.props.rideCoordinates || this.props.rideCoordinates.get('rideID') !== this.props.ride.get('_id')) {
      this.props.dispatch(loadRideCoordinates(this.props.ride.get('_id')))
    }
  }

  removeTopbarButtons () {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [],
        leftButtons: [],
      }
    })
  }

  openPhotoMenu (coverPhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: coverPhotoID
    })
    this.removeTopbarButtons()
  }

  clearMenus () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null,
      showSelectHorseMenu: false,
      selectedHorseID: null
    })
    this.setTopbarButtons(this.props)
  }

  openSelectHorseMenu (horseID) {
    this.setState({
      showSelectHorseMenu: true,
      selectedHorseID: horseID
    })
    this.removeTopbarButtons()
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
    this.clearMenus()
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
    this.clearMenus()
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

  rideHorses () {
    return this.props.rideHorses.filter(rh => {
      return rh.get('rideID') === this.props.rideID
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

  trimRide(values) {
    this.setState({
      trimValues: values,
    })
  }

  selectHorse (selectionType, horseID) {
    let foundRideHorse
    this.rideHorses().valueSeq().forEach((rideHorse) => {
      if (rideHorse.get('horseID') === horseID
        && rideHorse.get('rideID') === this.props.ride.get('_id')
        && rideHorse.get('rideHorseType') === selectionType) {
        foundRideHorse = rideHorse
      }
    })
    if (!foundRideHorse) {
      foundRideHorse = Map({
        _id: `${this.props.ride.get('_id')}_${horseID}_${selectionType}`,
        rideID: this.props.ride.get('_id'),
        horseID: horseID,
        rideHorseType: selectionType,
        type: 'rideHorse',
        timestamp: unixTimeNow(),
        userID: this.props.userID,
      })
    }
    if (selectionType === 'rider') {
      // remove this after everyone on version > 43
      this.props.dispatch(rideUpdated(this.props.ride.set('horseID', horseID)))
    }
    foundRideHorse = foundRideHorse.set('deleted', false)
    this.props.dispatch(rideHorseUpdated(foundRideHorse))
    this.clearMenus()
  }

  unselectHorse (horseID) {
    this.rideHorses().valueSeq().forEach((rideHorse) => {
      if (rideHorse.get('horseID') === horseID) {
        this.props.dispatch(rideHorseUpdated(
          rideHorse.set('deleted', true),
        ))
      }
    })
    // when everyone is on version > 43 we can remove horseID from the ride
    // record then we can get rid of this
    if (this.props.ride.get('horseID') === horseID) {
      this.props.dispatch(rideUpdated(this.props.ride.set('horseID', null)))
    }
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
        clearMenus={this.clearMenus}
        createPhoto={this.createPhoto}
        discardRide={this.discardRide}
        discardModalOpen={this.state.discardModalOpen}
        horses={this.memoizedHorses()}
        horsePhotos={this.props.horsePhotos}
        markPhotoDeleted={this.markPhotoDeleted}
        rideCoordinates={this.props.rideCoordinates}
        openPhotoMenu={this.openPhotoMenu}
        openSelectHorseMenu={this.openSelectHorseMenu}
        ride={this.props.ride}
        ridePhotos={this.memoizedAllPhotos(
          this.props.ridePhotos,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs)
        }
        rideHorses={this.rideHorses()} // memoize this
        selectedPhotoID={this.state.selectedPhotoID}
        selectedHorseID={this.state.selectedHorseID}
        selectHorse={this.selectHorse}
        setDiscardModalOpen={this.setDiscardModalOpen}
        showPhotoMenu={this.state.showPhotoMenu}
        showSelectHorseMenu={this.state.showSelectHorseMenu}
        trimRide={this.trimRide}
        trimValues={this.state.trimValues}
        unselectHorse={this.unselectHorse}
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
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    newRide,
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    rideCoordinates: pouchState.get('selectedRideCoordinates'),
    rideElevations: pouchState.get('selectedRideElevations'),
    rideHorses: pouchState.get('rideHorses'),
    ridePhotos: pouchState.get('ridePhotos'),
    stashedRidePhotos: localState.getIn(['ridePhotoStash', ridePhotoStashIndex]) || Map(),
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(UpdateRideContainer)
