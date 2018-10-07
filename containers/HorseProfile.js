import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { addHorseUser, deleteHorseUser, uploadHorsePhoto } from '../actions'
import { brand } from '../colors'
import { PHOTO_LIGHTBOX, PROFILE, UPDATE_HORSE } from '../screens'
import HorseProfile from '../components/HorseProfile/HorseProfile'
import { logRender } from '../helpers'

class HorseProfileContainer extends PureComponent {
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
        // @TODO: THIS SHOULD ONLY SHOW IF THE USER IS A RIDER OF THIS HORSE
        rightButtons: [
          {
            id: 'archive',
            text: 'Archive',
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
      modalOpen: false
    }
    this.addRider = this.addRider.bind(this)
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.closeLightbox = this.closeLightbox.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.horseOwner = this.horseOwner.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showRiderProfile = this.showRiderProfile.bind(this)
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
    }
  }

  showPhotoLightbox (source) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          source,
          close: this.closeLightbox
        }
      }
    })
  }

  closeLightbox () {
    Navigation.pop(this.props.componentId)
  }

  addRider () {
    this.props.dispatch(addHorseUser(this.props.horse, this.props.user))
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

  deleteHorse () {
    this.props.dispatch(deleteHorseUser(this.props.horse.get('_id'), this.props.user.get('_id')))
    Navigation.pop(this.props.componentId)
  }

  uploadPhoto (location) {
    this.props.dispatch(uploadHorsePhoto(location, this.props.horse.get('_id')))
  }

  thisHorsesRides () {
    return this.props.rides.valueSeq().reduce((accum, r) => {
      if (r.get('horseID') === this.props.horse.get('_id')) {
        accum.push(r)
      }
      return accum
    }, [])
  }

  thisHorsesRiders () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('horseID') === this.props.horse.get('_id')) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.users.get(hu.get('userID'))
    })
  }

  horseOwner () {
    let user
    this.props.horseUsers.valueSeq().forEach((horseUser) => {
      if (horseUser.get('owner') === true && horseUser.get('horseID') === this.props.horse.get('_id')) {
        user = this.props.users.get(horseUser.get('userID'))
      }
    })
    if (!user) {
      throw Error('Horse has no owner.')
    }
    return user
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
        horseOwner={this.horseOwner()}
        modalOpen={this.state.modalOpen}
        rides={this.thisHorsesRides()}
        riders={this.thisHorsesRiders()}
        showRiderProfile={this.showRiderProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        uploadPhoto={this.uploadPhoto}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    horseUsers: mainState.get('horseUsers'),
    horses: mainState.get('horses'),
    horse: mainState.getIn(['horses', passedProps.horse.get('_id')]),
    rides: mainState.get('rides'),
    user: mainState.get('users').get(localState.get('userID')),
    userID: localState.get('userID'),
    users: mainState.get('users')
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
