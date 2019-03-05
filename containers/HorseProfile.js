import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import { List, Map } from 'immutable'

import {
  createHorsePhoto,
  horseUpdated,
} from '../actions/standard'
import {
  addHorseUser,
  deleteHorseUser,
  persistHorseWithPhoto,
  persistHorseUser,
} from '../actions/functional'
import BackgroundComponent from '../components/BackgroundComponent'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import { PHOTO_LIGHTBOX, PROFILE, UPDATE_HORSE } from '../screens'
import HorseProfile from '../components/HorseProfile/HorseProfile'


class HorseProfileContainer extends BackgroundComponent {
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
        title: {
          color: 'white',
        },
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.addRider = this.addRider.bind(this)
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.horseUser = this.horseUser.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showRiderProfile = this.showRiderProfile.bind(this)
    this.thisHorsesPhotos = this.thisHorsesPhotos.bind(this)
    this.thisHorsesRides = this.thisHorsesRides.bind(this)
    this.thisHorsesRiders = this.thisHorsesRiders.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    Navigation.events().bindComponent(this);

    if (props.ownerID === props.userID) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'archive',
              text: 'Archive',
              color: 'white'
            },
            {
              id: 'edit',
              text: 'Edit',
              color: 'white'
            }
          ]
        }
      })
    } else if (this.thisHorsesRiders().indexOf(props.user) >= 0) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [{
            id: 'archive',
            text: 'Archive',
            color: 'white'
          }]
        }
      })
    }
  }

  showPhotoLightbox (sources) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources,
        }
      }
    })
  }

  addRider () {
    this.props.dispatch(addHorseUser(this.props.horse, this.props.user))
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [{
          id: 'archive',
          text: 'Archive',
          color: 'white'
        }]
      }
    })
  }

  closeDeleteModal () {
    this.setState({
      modalOpen: false
    })
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'edit') {
      Navigation.push(this.props.componentId, {
        component: {
          name: UPDATE_HORSE,
          title: "Update Horse",
          passProps: {
            horseID: this.props.horse.get('_id'),
            horseUserID: this.horseUser().get('_id'),
            newHorse: false
          },
        }
      })
    } else if (buttonId === 'archive') {
      this.setState({modalOpen: true})
    }
  }

  showRiderProfile (rider) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: rider,
        }
      }
    })
  }

  horseUser() {
    return this.props.horseUsers.valueSeq().filter(hu => {
      return hu.get('horseID') === this.props.horse.get('_id') && hu.get('userID') === this.props.userID
    }).first()
  }

  deleteHorse () {
    const horseUser = this.horseUser()
    this.props.dispatch(deleteHorseUser(horseUser.get('_id')))
    this.props.dispatch(persistHorseUser(horseUser.get('_id')))
    Navigation.pop(this.props.componentId)
  }

  uploadPhoto (location) {
    let photoID = generateUUID()
    this.props.dispatch(createHorsePhoto(
      this.props.horse.get('_id'),
      this.props.userID, {
        _id: photoID,
        timestamp: unixTimeNow(),
        uri: location
      }
    ))
    let updateHorse = this.props.horse
    if (this.props.userID === this.props.owner.get('_id')) {
      updateHorse = updateHorse.set('profilePhotoID', photoID)
    }
    this.props.dispatch(horseUpdated(updateHorse))
    this.props.dispatch(persistHorseWithPhoto(this.props.horse.get('_id'), photoID))
  }

  thisHorsesPhotos () {
    return this.props.horsePhotos.filter((photo) => {
      return photo.get('deleted') !== true && photo.get('horseID') === this.props.horse.get('_id')
    })
  }

  thisHorsesRides () {
    return this.props.rides.valueSeq().filter((r) => {
      return r.get('horseID') === this.props.horse.get('_id')
    }).toList()
  }

  thisHorsesRiders () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('horseID') === this.props.horse.get('_id')) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.users.get(hu.get('userID'))
    })
  }

  trainings (trainings, ownerID, horseID) {
    return trainings.getIn([`${ownerID}_training`, 'rides']).filter(t => {
      return t.get('deleted') !== true && (t.get('horseIDs').indexOf(horseID) >= 0)
    }).reduce((accum, t) => {
      const day = moment(t.get('startTime')).hour(0).minute(0).second(0).millisecond(0).toISOString()
      accum.get(day) ? accum = accum.set(day, accum.get(day).push(t)) : accum = accum.set(day, List([t]))
      return accum
    }, Map())
  }

  render() {
    logRender('HorseProfileContainer')
    return (
      <HorseProfile
        addRider={this.addRider}
        closeDeleteModal={this.closeDeleteModal}
        componentId={this.props.componentId}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        horseOwner={this.props.owner}
        horsePhotos={this.thisHorsesPhotos()}
        modalOpen={this.state.modalOpen}
        rides={this.thisHorsesRides()}
        riders={this.thisHorsesRiders()}
        showRiderProfile={this.showRiderProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        trainings={this.trainings(this.props.trainings, this.props.owner.get('_id'), this.props.horse.get('_id'))}
        uploadPhoto={this.uploadPhoto}
        user={this.props.user}
        userPhotos={this.props.userPhotos}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  return {
    activeComponent: localState.get('activeComponent'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horse: pouchState.getIn(['horses', passedProps.horse.get('_id')]),
    owner: pouchState.getIn(['users', passedProps.ownerID]),
    rides: pouchState.get('rides'),
    trainings: pouchState.get('trainings'),
    user: pouchState.getIn(['users', localState.get('userID')]),
    userID: localState.get('userID'),
    users: pouchState.get('users'),
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
