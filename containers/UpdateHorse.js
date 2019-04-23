import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { BackHandler, Keyboard } from 'react-native'
import { connect } from 'react-redux';
import { fromHsv } from 'react-native-color-picker'
import { Navigation } from 'react-native-navigation'


import UpdateHorse from '../components/UpdateHorse/UpdateHorse'
import {
  createHorsePhoto,
  deleteUnpersistedHorse,
  horseUpdated,
  horseUserUpdated,
} from '../actions/standard'
import { persistHorseUpdate } from '../actions/functional'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import { EqNavigation } from '../services'

class UpdateHorseContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Edit Horse",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0,
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
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
      cachedHorse: null,
      cachedHorseUser: null,
      doRevert: true,
      newPhotoIDs: [],
      deletedPhotoIDs: [],
      showPhotoMenu: false,
      selectedPhotoID: null,
      colorModalOpen: false,
      chosenColor: null,
    }
    this.changeColor = this.changeColor.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.goBack = this.goBack.bind(this)
    this.horseUpdated = this.horseUpdated.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.onColorModalClosed = this.onColorModalClosed.bind(this)
    this.openColorModal = this.openColorModal.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.setDefaultHorse = this.setDefaultHorse.bind(this)
    this.stashPhoto = this.stashPhoto.bind(this)
    this.thisHorsesPhotos = this.thisHorsesPhotos.bind(this)

    Navigation.events().bindComponent(this);

    this.memoThisHorsesPhotos = memoizeOne(this.thisHorsesPhotos)
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = state
    if (!state.cachedHorse && props.horse) {
      nextState = {
        ...state,
        cachedHorse: props.horse,
      }
    }
    if (!state.cachedHorseUser && props.horseUser) {
      nextState = {
        ...nextState,
        cachedHorseUser: props.horseUser
      }
    }
    return nextState
  }

  openColorModal (colorModalOpen) {
    return () => {
      this.removeMenuItems()
      this.setState({ colorModalOpen })
    }
  }

  onColorModalClosed () {
    this.replaceMenuItems()
    this.setState({ colorModalOpen: false})
    if (this.state.chosenColor) {
      this.horseUpdated(this.props.horse.merge({
        color: fromHsv(this.state.chosenColor)
      }))
    }
  }

  changeColor (chosenColor) {
    this.setState({ chosenColor })
  }

  openPhotoMenu (profilePhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: profilePhotoID
    })
    this.removeMenuItems()
  }

  removeMenuItems () {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [],
        leftButtons: [],
      }
    })
  }

  replaceMenuItems () {
    Navigation.mergeOptions(this.props.componentId, {
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

  clearPhotoMenu () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
    this.replaceMenuItems()
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
      this.setState({
        doRevert: false,
      })
      EqNavigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(persistHorseUpdate(
          this.props.horse.get('_id'),
          this.props.horseUser.get('_id'),
          this.state.deletedPhotoIDs,
          this.state.newPhotoIDs,
          this.state.cachedHorseUser.get('rideDefault')
        ))
      })
    }
  }

  componentWillUnmount () {
    this.goBack()
  }

  goBack () {
    if (this.state.doRevert) {
      if (this.props.newHorse) {
        this.props.dispatch(deleteUnpersistedHorse(
          this.props.horseID,
          this.props.horseUserID
        ))
      } else {
        this.props.dispatch(horseUpdated(this.state.cachedHorse))
        this.props.dispatch(horseUserUpdated(this.state.cachedHorseUser))
      }
    }
  }

  componentDidAppear() {
    BackHandler.addEventListener('hardwareBackPress', this.goBack)
  }

  componentDidDisappear() {
    BackHandler.removeEventListener('hardwareBackPress', this.goBack)
  }

  horseUpdated (horse) {
    this.props.dispatch(horseUpdated(horse))
  }

  stashPhoto (uri) {
    let horse = this.props.horse
    let timestamp = unixTimeNow()
    let _id = generateUUID()
    horse = horse.set('profilePhotoID', _id)
    this.props.dispatch(horseUpdated(horse))
    this.props.dispatch(
      createHorsePhoto(
        horse.get('_id'),
        this.props.userID,
        { _id, timestamp, uri }
      )
    )
    this.setState({
      newPhotoIDs: [...this.state.newPhotoIDs, _id]
    })
  }

  setDefaultHorse () {
    const newVal = !this.props.horseUser.get('rideDefault')
    this.props.dispatch(horseUserUpdated(
      this.props.horseUser.set('rideDefault', newVal)
    ))
  }

  thisHorsesPhotos (horsePhotos, deletedPhotoIDs) {
    return horsePhotos.filter((hp) => {
      return hp.get('deleted') !== true
        && hp.get('horseID') === this.props.horse.get('_id')
        && deletedPhotoIDs.indexOf(hp.get('_id')) < 0
    })
  }

  markPhotoDeleted (photoID) {
    if (photoID === this.props.horse.get('profilePhotoID')) {
      let swapped = false
      const allPhotos = this.memoThisHorsesPhotos(this.props.horsePhotos, this.state.deletedPhotoIDs)
      for (let otherPhoto of allPhotos.valueSeq()) {
        const id = otherPhoto.get('_id')
        if (id !== photoID && this.state.deletedPhotoIDs.indexOf(id) < 0) {
          swapped = true
          this.props.dispatch(horseUpdated(this.props.horse.set('profilePhotoID', id)))
        }
      }
      if (!swapped) {
        this.props.dispatch(horseUpdated(this.props.horse.set('profilePhotoID', null)))
      }
    }
    this.setState({
      deletedPhotoIDs: [...this.state.deletedPhotoIDs, photoID]
    })
  }

  render() {
    logRender('UpdateHorseContainer')
    const horsePhotos = this.memoThisHorsesPhotos(this.props.horsePhotos, this.state.deletedPhotoIDs)
    return (
      <UpdateHorse
        changeColor={this.changeColor}
        clearPhotoMenu={this.clearPhotoMenu}
        closeDeleteModal={this.closeDeleteModal}
        colorModalOpen={this.state.colorModalOpen}
        horse={this.props.horse}
        horsePhotos={horsePhotos}
        horseUpdated={this.horseUpdated}
        horseUser={this.props.horseUser}
        markPhotoDeleted={this.markPhotoDeleted}
        newHorse={this.props.newHorse}
        onColorModalClosed={this.onColorModalClosed}
        openColorModal={this.openColorModal}
        openPhotoMenu={this.openPhotoMenu}
        setDefaultHorse={this.setDefaultHorse}
        showPhotoMenu={this.state.showPhotoMenu}
        selectedPhotoID={this.state.selectedPhotoID}
        stashPhoto={this.stashPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const horseUser = pouchState.getIn(['horseUsers', passedProps.horseUserID])
  return {
    horse: pouchState.getIn(['horses', passedProps.horseID]),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUser,
    horseUsers: state.getIn(['pouchRecords', 'horseUsers']),
    userID: state.getIn(['localState', 'userID']),
    newHorse: passedProps.newHorse
  }
}

export default  connect(mapStateToProps)(UpdateHorseContainer)
