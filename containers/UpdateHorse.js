import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { BackHandler, Keyboard } from 'react-native'
import { connect } from 'react-redux';
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
      newPhotoIDs: [],
      deletedPhotoIDs: [],
      showPhotoMenu: false,
      selectedPhotoID: null
    }
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.goBack = this.goBack.bind(this)
    this.horseUpdated = this.horseUpdated.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
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

  openPhotoMenu (profilePhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: profilePhotoID
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
    Navigation.mergeOptions(this.props.componentId, {
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

  navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    if (buttonId === 'save') {
      Navigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(persistHorseUpdate(
          this.props.horse.get('_id'),
          this.props.horseUser.get('_id'),
          this.state.deletedPhotoIDs,
          this.state.newPhotoIDs,
          this.state.cachedHorseUser.get('rideDefault')
        ))
      })
    } else if (buttonId === 'back') {
      this.goBack()
    }
  }

  goBack () {
    if (this.props.newHorse) {
      Navigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(deleteUnpersistedHorse(
          this.props.horseID,
          this.props.horseUserID
        ))
      })
    } else {
      Navigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(horseUpdated(this.state.cachedHorse))
        this.props.dispatch(horseUserUpdated(this.state.cachedHorseUser))
      })
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
        clearPhotoMenu={this.clearPhotoMenu}
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        horsePhotos={horsePhotos}
        horseUpdated={this.horseUpdated}
        horseUser={this.props.horseUser}
        markPhotoDeleted={this.markPhotoDeleted}
        newHorse={this.props.newHorse}
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
