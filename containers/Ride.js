import { fromJS } from 'immutable'
import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { Keyboard } from 'react-native'
import { connect } from 'react-redux';

import Ride from '../components/Ride/Ride'
import {
  clearSelectedRideCoordinates,
  popShowRideShown,
  rideUpdated,
  setShowingRide,
} from '../actions/standard'
import {
  createRideComment,
  loadRideCoordinates,
  persistRide,
} from '../actions/functional'
import { brand } from '../colors'
import { logRender, unixTimeNow } from '../helpers'
import {
  HORSE_PROFILE,
  MAP,
  PHOTO_LIGHTBOX,
  PROFILE,
  RIDE_CHARTS,
  UPDATE_RIDE
} from '../screens'

class RideContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        title: {
          color: 'white',
          fontSize: 20
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
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
          name: UPDATE_RIDE,
          passProps: {
            rideID: this.props.ride.get('_id')
          },
        },
      })
    } else if (buttonId === 'delete') {
      this.setState({modalOpen: true})
    } else if (buttonId === 'back') {
      Keyboard.dismiss()
      Navigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(clearSelectedRideCoordinates())
      })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false,
      titleTouchCount: 0,
      newComment: null
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteRide = this.deleteRide.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.rideComments = this.rideComments.bind(this)
    this.showFullscreenMap = this.showFullscreenMap.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.submitComment = this.submitComment.bind(this)
    this.thisRidesPhotos = this.thisRidesPhotos.bind(this)
    this.updateNewComment = this.updateNewComment.bind(this)
    this.viewRideCharts = this.viewRideCharts.bind(this)

    Navigation.events().bindComponent(this);

    if (props.userID !== props.rideUser.get('_id')) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: []
        }
      })
    }

    this.memoRideComments = memoizeOne(this.rideComments)
    this.memoThisRidesPhotos = memoizeOne(this.thisRidesPhotos)
  }

  viewRideCharts () {
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE_CHARTS,
        passProps: {
          rideID: this.props.ride.get('_id'),
        }
      }
    })
  }

  updateNewComment (newComment) {
    this.setState({newComment})
    if (newComment.slice(-1) === '\n') {
      Keyboard.dismiss()
      this.submitComment()
    }
  }

  submitComment () {
    if (!!this.state.newComment === true) {
      this.props.dispatch(createRideComment({
        comment: this.state.newComment,
        rideID: this.props.ride.get('_id'),
        timestamp: unixTimeNow()
      }))
      this.setState({newComment: null})
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

  componentDidMount () {
    if(!this.props.rideCoordinates || this.props.rideCoordinates.get('rideID') !== this.props.ride.get('_id')) {
      this.props.dispatch(loadRideCoordinates(this.props.ride.get('_id')))
    }
    this.props.dispatch(setShowingRide(this.props.ride.get('_id')))
    if (this.props.isPopShow) {
      this.props.dispatch(popShowRideShown())
    }
  }

  componentWillUnmount () {
    this.props.dispatch(setShowingRide(null))
  }

  deleteRide () {
    this.props.dispatch(rideUpdated(this.props.ride.set('deleted', true)))
    this.props.dispatch(persistRide(this.props.ride.get('_id'), false, [], [], null))
    Navigation.pop(this.props.componentId)
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

  thisRidesPhotos (ridePhotos) {
    return ridePhotos.filter((rp) => {
      return rp.get('rideID') === this.props.ride.get('_id') && rp.get('deleted') !== true
    })
  }

  rideComments (rideComments) {
    return rideComments.valueSeq().filter(
      (rc) => rc.get('rideID') === this.props.ride.get('_id')
    ).sort(
      (a, b) => a.get('timestamp') - b.get('timestamp')
    ).toList()
  }

  rideHorses () {
    // remove this when you've created rideHorses for all old rides and everyone's on > 43
    let rideHorses = this.props.rideHorses.filter(rh => {
      return rh.get('rideID') === this.props.ride.get('_id') && rh.get('deleted') !== true
    })
    if (this.props.ride.get('horseID') && !rideHorses.count()) {
      rideHorses = fromJS({
        'a fake ID': {
        _id: 'a fake ID',
        rideID: this.props.ride.get('_id'),
        horseID: this.props.ride.get('horseID'),
        rideHorseType: 'rider',
        type: 'rideHorse',
        timestamp: unixTimeNow(),
        userID: this.props.userID,
      }})
    }
    // remove this when you've created rideHorses for all old rides and everyone's on > 43
    return rideHorses
  }

  horseOwnerIDs () {
    return this.props.horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  render() {
    logRender('RideContainer')
    return (
      <Ride
        closeDeleteModal={this.closeDeleteModal}
        deleteRide={this.deleteRide}
        horses={this.props.horses}
        horsePhotos={this.props.horsePhotos}
        horseOwnerIDs={this.horseOwnerIDs()} //memoize this
        modalOpen={this.state.modalOpen}
        newComment={this.state.newComment}
        ride={this.props.ride}
        rideUser={this.props.rideUser}
        rideComments={this.memoRideComments(this.props.rideComments)}
        rideCoordinates={this.props.rideCoordinates}
        rideElevations={this.props.rideElevations}
        rideHorses={this.rideHorses()} // memoize this
        ridePhotos={this.memoThisRidesPhotos(this.props.ridePhotos)}
        showFullscreenMap={this.showFullscreenMap}
        showHorseProfile={this.showHorseProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        showProfile={this.showProfile}
        skipToComments={this.props.skipToComments}
        submitComment={this.submitComment}
        updateNewComment={this.updateNewComment}
        userID={this.props.userID}
        userPhotos={this.props.userPhotos}
        users={this.props.users}
        viewRideCharts={this.viewRideCharts}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const ride = pouchState.getIn(['rides', passedProps.rideID])
  const rideCoordinates = pouchState.get('selectedRideCoordinates')
  const rideElevations = pouchState.getIn(['rideElevations', passedProps.rideID + '_elevations'])
  const userID = localState.get('userID')
  return {
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    isPopShow: passedProps.isPopShow,
    ride,
    rideComments: pouchState.get('rideComments'),
    rideCoordinates,
    rideElevations,
    rideHorses: pouchState.get('rideHorses'),
    ridePhotos: pouchState.get('ridePhotos'),
    rideUser: pouchState.getIn(['users', ride.get('userID')]),
    skipToComments: passedProps.skipToComments,
    userID,
    users: pouchState.get('users'),
    userPhotos: pouchState.get('userPhotos')
  }
}

export default  connect(mapStateToProps)(RideContainer)
