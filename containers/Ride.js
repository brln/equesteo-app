import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import Ride from '../components/Ride/Ride'
import { updateRide } from '../actions'
import { brand } from '../colors'
import { logRender } from '../helpers'
import {
  HORSE_PROFILE,
  MAP,
  PHOTO_LIGHTBOX,
  PROFILE,
  RIDE_DETAILS
} from '../screens'

class RideContainer extends PureComponent {
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
          fontSize: 20
        },
        rightButtons: [
          {
            id: 'edit',
            text: 'Edit',
            color: 'white'
          },
          {
            id: 'delete',
            text: 'Delete',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'edit') {
      Navigation.push(this.props.componentId, {
        component: {
          name: RIDE_DETAILS,
          passProps: {
            rideID: this.props.ride.get('_id')
          },
        },
      })
    } else if (buttonId === 'delete') {
      this.setState({modalOpen: true})
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false,
      titleTouchCount: 0
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteRide = this.deleteRide.bind(this)
    this.horses = this.horses.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.showFullscreenMap = this.showFullscreenMap.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showProfile = this.showProfile.bind(this)

    Navigation.events().bindComponent(this);

    if (props.userID !== props.rideUser.get('_id')) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: []
        }
      })
    }
  }

  showProfile (user) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: user,
        }
      }
    })
  }

  closeDeleteModal () {
    this.setState({
      modalOpen: false
    })
  }

  deleteRide () {
    this.props.dispatch(updateRide(this.props.ride.set('deleted', true)))
    Navigation.pop(this.props.componentId)
  }

  horses () {
    return this.props.horses.toList()
  }

  showPhotoLightbox (sources) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources
        }
      },
    })
  }

  showFullscreenMap (rideID) {
    Navigation.push(this.props.componentId, {
      component: {
        name: MAP,
        passProps: { rideID }
      }
    })
  }

  showHorseProfile (horse, ownerID) {
    Navigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: { horse, ownerID },
      }
    })
  }

  rideHorseOwnerID () {
    let rideHorseOwnerID
    this.props.horseUsers.forEach(hu => {
      if (hu.get('owner') === true && hu.get('horseID') === this.props.ride.get('horseID')) {
        rideHorseOwnerID = hu.get('userID')
      }
    })
    return rideHorseOwnerID
  }

  render() {
    logRender('RideContainer')
    return (
      <Ride
        closeDeleteModal={this.closeDeleteModal}
        deleteRide={this.deleteRide}
        horses={this.horses()}
        modalOpen={this.state.modalOpen}
        ride={this.props.ride}
        rideHorseOwnerID={this.rideHorseOwnerID()}
        rideUser={this.props.rideUser}
        rideElevations={this.props.rideElevations}
        showFullscreenMap={this.showFullscreenMap}
        showHorseProfile={this.showHorseProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        showProfile={this.showProfile}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const ride = mainState.getIn(['rides', passedProps.rideID])
  const rideElevations = mainState.getIn(['rideElevations', passedProps.rideID + '_elevations'])
  const userID = localState.get('userID')
  return {
    horses: mainState.get('horses'),
    horseUsers: mainState.get('horseUsers'),
    ride,
    rideElevations,
    rideUser: mainState.getIn(['users', ride.get('userID')]),
    userID
  }
}

export default  connect(mapStateToProps)(RideContainer)
