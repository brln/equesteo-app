import { fromJS, Map } from 'immutable'
import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import React from 'react'
import { Alert } from 'react-native'
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
  setActiveAtlasEntry,
  stopStashNewLocations,
  stashRidePhoto,
} from '../actions/standard'
import {
  catchAsyncError,
  doSync,
  loadRideCoordinates,
  persistRide,
  stopHoofTracksDispatcher,
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
import { PHOTO_LIGHTBOX, RIDE } from '../screens/main'
import { EqNavigation } from '../services'
import Amplitude, {
  DISCARD_NEW_RIDE,
  MARK_RIDE_PRIVATE_LAND,
  MARK_RIDE_PUBLIC_LAND,
  SAVE_RIDE,
  SAVE_NEW_RIDE,
  SET_SINGLE_RIDE_TO_PRIVATE
} from "../services/Amplitude"

class UpdateRideContainer extends BackgroundComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
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
      doRevert: true,
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
    this.changePrivateProperty = this.changePrivateProperty.bind(this)
    this.changePublic = this.changePublic.bind(this)
    this.changePubliclyAccessible = this.changePubliclyAccessible.bind(this)
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
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.stashedRidePhotoKey = this.stashedRidePhotoKey.bind(this)
    this.trimRide = this.trimRide.bind(this)
    this.unselectHorse = this.unselectHorse.bind(this)
    this.updateLocalRideCoords = this.updateLocalRideCoords.bind(this)

    this.memoizedHorses = memoizeOne(this.horses)
    this.memoizedRideHorses = memoizeOne(this.rideHorses)
    this.memoizedAllPhotos = memoizeOne(this.allPhotos)

    Navigation.events().bindComponent(this);
    this.setTopbarButtons(props)
  }

  setTopbarButtons (props) {
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
      if (buttonId === 'save') {
        Amplitude.logEvent(SAVE_NEW_RIDE)
        this.setState({
          doRevert: false
        })
        Navigation.mergeOptions(this.props.componentId, {topBar: {rightButtons: []}})
        this.updateLocalRideCoords()
        this.props.dispatch(stopHoofTracksDispatcher())
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          true,
          this.props.rideCoordinates,
          this.props.rideElevations,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs,
          this.state.trimValues,
          this.memoizedRideHorses(this.props.rideHorses, this.props.rideID),
        )).then(() => {
          return EqNavigation.popToRoot(this.props.componentId)
        }).then(() => {
          this.props.dispatch(clearPausedLocations())
          this.props.dispatch(stopLocationTracking())
          this.props.dispatch(discardCurrentRide())
          this.props.dispatch(setActiveAtlasEntry(null))
          return EqNavigation.push(this.props.activeComponent, {
            component: {
              name: RIDE,
              passProps: {
                rideID: this.props.rideID,
                skipToComments: false,
              }
            }
          })
        }).then(() => {
          this.props.dispatch(doSync())
        }).catch(catchAsyncError(this.props.dispatch, 'UpdateRide.navigationButtonPressed'))
      } else if (buttonId === 'discard') {
        Amplitude.logEvent(DISCARD_NEW_RIDE)
        this.props.dispatch(setActiveAtlasEntry(null))
        Alert.alert(
          'Discard Ride?',
          'Are you sure you want to discard this ride?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: this.discardRide,
              style: 'destructive'
            },
          ],
          {cancelable: true},
        )
      }
    } else {
      if (buttonId === 'save') {
        Amplitude.logEvent(SAVE_RIDE)
        this.setState({
          doRevert: false
        })
        this.props.dispatch(persistRide(
          this.props.ride.get('_id'),
          false,
          this.props.rideCoordinates,
          this.props.rideElevations,
          this.props.stashedRidePhotos,
          this.state.deletedPhotoIDs,
          this.state.trimValues,
          this.memoizedRideHorses(this.props.rideHorses, this.props.rideID),
        )).then(() => {
          Navigation.popTo(this.props.popBackTo).then(() => {
            this.updateLocalRideCoords()
          })
        })
      } else if (buttonId === 'discard') {
        EqNavigation.pop(this.props.componentId).catch(() => {})
      }
    }
  }

  componentWillUnmount () {
    if (this.state.doRevert) {
      if (this.props.newRide) {
        this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
        this.props.dispatch(stopStashNewLocations())
        this.props.dispatch(mergeStashedLocations())
      } else {
        this.props.dispatch(rideUpdated(this.state.cachedRide))
        this.props.dispatch(clearRidePhotoStash(this.stashedRidePhotoKey()))
      }
    }
  }

  discardRide () {
    this.props.dispatch(stopHoofTracksDispatcher())
    this.setState({
      doRevert: false
    })
    EqNavigation.popToRoot(this.props.componentId).then(() => {
      this.props.dispatch(clearPausedLocations())
      this.props.dispatch(clearRidePhotoStash(this.stashedRidePhotoKey()))
      this.props.dispatch(stopLocationTracking())
      this.props.dispatch(discardCurrentRide())
      this.props.dispatch(deleteUnpersistedRide(this.props.ride.get('_id')))
    }).catch(() => {})
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
      ).set(
        'startTime', firstCoord.get('timestamp')
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
    const isPublic = !this.props.ride.get('isPublic')
    if (!isPublic) {
      Amplitude.logEvent(SET_SINGLE_RIDE_TO_PRIVATE)
    }
    this.props.dispatch(rideUpdated(
      this.props.ride.set('isPublic', isPublic)
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

  changePubliclyAccessible () {
    const newVal = !this.props.ride.get('publiclyAccessible')
    let newRide = this.props.ride.set('publiclyAccessible', newVal)
    if (newVal === true) {
      Amplitude.logEvent(MARK_RIDE_PUBLIC_LAND)
      newRide = newRide.set('containsPrivateProperty', false)
    }
    this.props.dispatch(rideUpdated(newRide))
  }

  changePrivateProperty () {
    const newVal = !this.props.ride.get('containsPrivateProperty')
    let newRide = this.props.ride.set('containsPrivateProperty', newVal)
    if (newVal === true) {
      Amplitude.logEvent(MARK_RIDE_PRIVATE_LAND)
      newRide = newRide.set('publiclyAccessible', false)
    }
    this.props.dispatch(rideUpdated(newRide))
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

  showPhotoLightbox (sources) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources
        }
      },
    }).catch(() => {})
  }

  horses (horseUsers, horses, userID) {
    return horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return horses.get(hu.get('horseID'))
    })
  }

  rideHorses (rideHorses, rideID) {
    return rideHorses.filter(rh => {
      return rh.get('rideID') === rideID
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
    const rideHorses = this.memoizedRideHorses(this.props.rideHorses, this.props.rideID)

    if (selectionType === 'rider' && rideHorses.count() > 0) {
      let foundRiderHorse
      rideHorses.valueSeq().forEach((rideHorse) => {
        if (rideHorse.get('rideID') === this.props.ride.get('_id')
          && rideHorse.get('rideHorseType') === 'rider'
          && rideHorse.get('deleted') !== true) {
          foundRiderHorse = rideHorse
        }
      })
      if (foundRiderHorse) {
        foundRiderHorse = foundRiderHorse.set('deleted', true)
        this.props.dispatch(rideHorseUpdated(foundRiderHorse))
      }
    }

    rideHorses.valueSeq().forEach((rideHorse) => {
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
    foundRideHorse = foundRideHorse.set('deleted', false)
    this.props.dispatch(rideHorseUpdated(foundRideHorse))


    this.clearMenus()
  }

  unselectHorse (horseID) {
    this.memoizedRideHorses(this.props.rideHorses, this.props.rideID).valueSeq().forEach((rideHorse) => {
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
    if (this.props.ride && this.props.rideCoordinates && this.props.rideElevations) {
      // Sometimes (I think) this component sticks around after it should, then the
      // currentRideCoordinates get cleared, and it borks up because it's trying to
      // operate on that data.
      return (
        <UpdateRide
          changeCoverPhoto={this.changeCoverPhoto}
          changeRideName={this.changeRideName}
          changeRideNotes={this.changeRideNotes}
          changeHorseID={this.changeHorseID}
          changePublic={this.changePublic}
          changePrivateProperty={this.changePrivateProperty}
          changePubliclyAccessible={this.changePubliclyAccessible}
          clearMenus={this.clearMenus}
          createPhoto={this.createPhoto}
          discardRide={this.discardRide}
          discardModalOpen={this.state.discardModalOpen}
          horses={this.memoizedHorses(this.props.horseUsers, this.props.horses, this.props.userID)}
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
          rideHorses={this.memoizedRideHorses(this.props.rideHorses, this.props.rideID)}
          selectedPhotoID={this.state.selectedPhotoID}
          selectedHorseID={this.state.selectedHorseID}
          selectHorse={this.selectHorse}
          showPhotoLightbox={this.showPhotoLightbox}
          showPhotoMenu={this.state.showPhotoMenu}
          showSelectHorseMenu={this.state.showSelectHorseMenu}
          trimRide={this.trimRide}
          trimValues={this.state.trimValues}
          unselectHorse={this.unselectHorse}
        />
      )
    } else {
      return null
    }
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
    popBackTo: passedProps.popBackTo,
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
