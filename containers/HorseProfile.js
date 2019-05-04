import memoizeOne from 'memoize-one'
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
import { HORSE_TOOLS, PHOTO_LIGHTBOX, PROFILE, UPDATE_HORSE } from '../screens/main'
import HorseProfile from '../components/HorseProfile/HorseProfile'
import { EqNavigation } from '../services'


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
    this.addRider = this.addRider.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.horseUser = this.horseUser.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showRiderProfile = this.showRiderProfile.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    Navigation.events().bindComponent(this);

    this.memoThisHorsesPhotos = memoizeOne(this.thisHorsesPhotos.bind(this))
    this.memoThisHorsesRiders = memoizeOne(this.thisHorsesRiders.bind(this))

    if (props.ownerID === props.userID) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'tools',
              text: 'Tools',
              color: 'white'
            },
          ]
        }
      })
    }
  }

  showPhotoLightbox (sources) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources,
        }
      }
    }).catch(() => {})
  }

  addRider () {
    this.props.dispatch(addHorseUser(this.props.horse, this.props.user))
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'tools') {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: HORSE_TOOLS,
          passProps: {
            barnComponentID: this.props.barnComponentID,
            horseID: this.props.horse.get('_id'),
            horseUserID: this.horseUser().get('_id'),
          },
        }
      }).catch(() => {})
    }
  }

  showRiderProfile (rider) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: rider,
        }
      }
    }).catch(() => {})
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
    EqNavigation.pop(this.props.componentId).catch(() => {})
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

  thisHorsesPhotos (horsePhotos, horse) {
    return horsePhotos.filter((photo) => {
      return photo.get('horseID') === horse.get('_id') && photo.get('deleted') !== true
    })
  }

  thisHorsesRiders (horseUsers, horse, users) {
    return horseUsers.valueSeq().filter((hu) => {
      return (hu.get('horseID') === horse.get('_id')) && hu.get('deleted') !== true
    }).map((hu) => {
      return users.get(hu.get('userID'))
    })
  }

  trainings (trainings, owner, horse) {
    const ownerID = owner && owner.get('_id')
    const horseID = horse && horse.get('_id')
    if (ownerID && horseID) {
      // If an owner that you're following transfers the horse to a user you aren't following,
      // you won't have the owner record or trainings locally, but the ride is still available to
      // look at on the feed.
      return trainings.getIn([`${ownerID}_training`, 'rides']).filter(t => {
        return t.get('deleted') !== true && (t.get('horseIDs').indexOf(horseID) >= 0)
      }).reduce((accum, t) => {
        const day = moment(t.get('startTime')).hour(0).minute(0).second(0).millisecond(0).toISOString()
        accum.get(day) ? accum = accum.set(day, accum.get(day).push(t)) : accum = accum.set(day, List([t]))
        return accum
      }, Map())
    }
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
        horsePhotos={this.memoThisHorsesPhotos(this.props.horsePhotos, this.props.horse)}
        owner={this.props.owner}
        riders={this.memoThisHorsesRiders(this.props.horseUsers, this.props.horse, this.props.users)}
        showRiderProfile={this.showRiderProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        trainings={this.trainings(this.props.trainings, this.props.owner, this.props.horse)}
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
    barnComponentID: passedProps.barnComponentID,
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
