import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import { Keyboard } from 'react-native'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import UpdateHorse from '../components/UpdateHorse/UpdateHorse'
import {
  deleteUnpersistedHorse,
  horseUpdated,
  horseUserUpdated,
  persistHorse,
  persistHorseUser,
  uploadHorsePhoto,
} from '../actions'
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
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      cachedHorse: null,
      cachedHorseUser: null,
      newPhotoIDs: [],
    }
    this.commitDefaultHorse = this.commitDefaultHorse.bind(this)
    this.horseUpdated = this.horseUpdated.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.setDefaultHorse = this.setDefaultHorse.bind(this)
    this.stashPhoto = this.stashPhoto.bind(this)
    this.uploadNewPhotos = this.uploadNewPhotos.bind(this)

    Navigation.events().bindComponent(this);
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

  async navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    if (buttonId === 'save') {
      Navigation.pop(this.props.componentId)
      // You have to await these, there is a bug (in pouch?) which will delete
      // all your horse data if you call these at the same time
      await this.props.dispatch(persistHorse(this.props.horse.get('_id')))
      await this.props.dispatch(persistHorseUser(this.props.horseUser.get('_id')))
      this.uploadNewPhotos()
      this.commitDefaultHorse()
    } else if (buttonId === 'back') {
      if (this.props.newHorse) {
        await Navigation.pop(this.props.componentId)
        this.props.dispatch(deleteUnpersistedHorse(
          this.props.horseID,
          this.props.horseUserID
        ))
      } else {
        this.props.dispatch(horseUpdated(this.state.cachedHorse))
        this.props.dispatch(horseUserUpdated(this.state.cachedHorseUser))
        await Navigation.pop(this.props.componentId)
      }
    }

  }

  horseUpdated (horse) {
    this.props.dispatch(horseUpdated(horse))
  }

  stashPhoto (uri) {
    let horse = this.props.horse
    let timestamp = unixTimeNow()
    let photoID = generateUUID()
    horse = horse.set('profilePhotoID', photoID)
    this.props.dispatch(
      horseUpdated(
        horse.setIn(
          ['photosByID', photoID],
          Map({timestamp, uri})
        )
      )
    )
    this.setState({
      newPhotoIDs: [...this.state.newPhotoIDs, photoID]
    })
  }

  uploadNewPhotos () {
    for (let photoID of this.state.newPhotoIDs) {
      this.props.dispatch(
        uploadHorsePhoto(
          photoID,
          this.props.horse.getIn(['photosByID', photoID, 'uri']),
          this.props.horse.get('_id')
        )
      )
    }
  }

  setDefaultHorse () {
    const newVal = !this.props.horseUser.get('rideDefault')
    this.props.dispatch(horseUserUpdated(
      this.props.horseUser.set('rideDefault', newVal)
    ))
  }

  commitDefaultHorse () {
    if (this.state.cachedHorseUser.get('rideDefault') !== this.props.horseUser.get('rideDefault')
      && this.props.horseUser.get('rideDefault') === true) {
       this.props.horseUsers.valueSeq().forEach(async horseUser => {
        if (horseUser !== this.props.horseUser
          && horseUser.get('userID') === this.props.userID
          && horseUser.get('rideDefault') === true) {
          const withoutDefault = horseUser.set('rideDefault', false)
          this.props.dispatch(horseUserUpdated(withoutDefault))
          this.props.dispatch(persistHorseUser(withoutDefault.get('_id')))
        }
      })
    }
  }

  render() {
    logRender('UpdateHorseContainer')
    return (
      <UpdateHorse
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        horseUpdated={this.horseUpdated}
        horseUser={this.props.horseUser}
        newHorse={this.props.newHorse}
        setDefaultHorse={this.setDefaultHorse}
        stashPhoto={this.stashPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const horse = state.getIn(['pouchRecords' , 'horses', passedProps.horseID])
  const horseUser = state.getIn(['pouchRecords', 'horseUsers', passedProps.horseUserID])
  return {
    horse,
    horseUser,
    horseUsers: state.getIn(['pouchRecords', 'horseUsers']),
    userID: state.getIn(['localState', 'userID']),
    newHorse: passedProps.newHorse
  }
}

export default  connect(mapStateToProps)(UpdateHorseContainer)
