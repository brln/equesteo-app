import memoizeOne from 'memoize-one';
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { Keyboard } from 'react-native'
import { connect } from 'react-redux';

import Ride from '../components/Ride/Ride'
import {
  clearSelectedRideCoordinates,
  setShowingRide,
} from '../actions/standard'
import functional from '../actions/functional'
import { brand } from '../colors'
import { logRender, unixTimeNow } from '../helpers'
import {
  HORSE_PROFILE,
  MAP,
  PHOTO_LIGHTBOX,
  PROFILE,
  RIDE_CHARTS,
  RIDE_TOOLS,
} from '../screens/consts/main'
import { EqNavigation } from '../services'
import Amplitude, {
  ADD_COMMENT,
  VIEW_RIDE_CHARTS,
} from "../services/Amplitude"
import { viewHorseOwnerIDs } from '../dataViews/dataViews'
import {Logger} from "../mixins/Logger"

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
        backButton: {
          color: 'white'
        },
        rightButtons: [{
          id: 'tools',
          text: 'Tools',
          color: 'white'
        }]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'tools') {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: RIDE_TOOLS,
          passProps: {
            rideID: this.props.ride.get('_id'),
            rideUserID: this.props.ride.get('userID'),
            popBackTo: this.props.componentId
          },
        },
      }).catch(() => {})
    }
  }

  constructor (props) {
    super(props)
    Object.assign(this, Logger)
    this.logError = this.logError.bind(this)
    this.logInfo = this.logInfo.bind(this)

    this.state = {
      modalOpen: false,
      titleTouchCount: 0,
      newComment: null
    }

    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.showFullscreenMap = this.showFullscreenMap.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.submitComment = this.submitComment.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.updateNewComment = this.updateNewComment.bind(this)
    this.viewRideCharts = this.viewRideCharts.bind(this)

    Navigation.events().bindComponent(this);

    this.memoAnyNotifications = memoizeOne(this.anyNotifications)
    this.memoPaceHorse = memoizeOne(this.paceHorse.bind(this))
    this.memoRideCarrots = memoizeOne(this.rideCarrots.bind(this))
    this.memoRideComments = memoizeOne(this.rideComments.bind(this))
    this.memoRideHorses = memoizeOne(this.rideHorses.bind(this))
    this.memoThisRidesPhotos = memoizeOne(this.thisRidesPhotos.bind(this))
  }

  componentDidAppear () {
    this.props.dispatch(setShowingRide(this.props.ride.get('_id')))
  }

  componentDidDisappear () {
    this.props.dispatch(setShowingRide(null))
  }

  componentWillUnmount () {
    this.props.dispatch(clearSelectedRideCoordinates())
  }

  viewRideCharts () {
    Amplitude.logEvent(VIEW_RIDE_CHARTS)
    EqNavigation.push(this.props.componentId, {
      component: {
        name: RIDE_CHARTS,
        passProps: {
          rideID: this.props.ride.get('_id'),
        }
      }
    }).catch(() => {})
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
      Amplitude.logEvent(ADD_COMMENT)
      this.props.dispatch(functional.createRideComment({
        comment: this.state.newComment,
        rideID: this.props.ride.get('_id'),
        timestamp: unixTimeNow()
      }))
      this.setState({newComment: null})
    }
  }

  showProfile (user) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: user,
        }
      }
    }).catch(() => {})
  }

  anyNotifications (notifications, ride) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true && ride.get('_id') === n.get('rideID')
    }).count() > 0
  }

  componentDidMount () {
    if(!this.props.rideCoordinates || this.props.rideCoordinates.get('rideID') !== this.props.ride.get('_id')) {
      this.props.dispatch(functional.loadRideCoordinates(this.props.ride.get('_id')))
      this.props.dispatch(functional.loadRideElevations(this.props.ride.get('_id')))
    }
    if (this.memoAnyNotifications(this.props.notifications, this.props.ride)) {
      this.props.dispatch(functional.clearRideNotifications(this.props.ride.get('_id')))
    }

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

  showFullscreenMap (rideID) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: MAP,
        passProps: { rideID }
      }
    }).catch(() => {})
  }

  showHorseProfile (horse, ownerID) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID,
          popBackTo: this.props.componentId
        },
      }
    }).catch(() => {})
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

  rideCarrots (rideCarrots) {
    const carrots = rideCarrots.valueSeq().filter(
      (rc) => rc.get('rideID') === this.props.ride.get('_id') && rc.get('deleted') !== true
    ).toList()
    return carrots
  }

  rideHorses (rideHorses) {
    return rideHorses.filter(rh => {
      return rh.get('rideID') === this.props.ride.get('_id') && rh.get('deleted') !== true
    })
  }

  paceHorse (horses, allRideHorses) {
    const rideHorses = this.memoRideHorses(allRideHorses).valueSeq()
    if (rideHorses.count()) {
      let paceHorse = horses.get(rideHorses.first().get('horseID'))
      if (rideHorses.count() > 1) {
        for (let rideHorse of rideHorses) {
          if (rideHorse.get('rideHorseType') === 'rider') {
            paceHorse = horses.get(rideHorse.get('horseID'))
            break
          }
        }
      }
      return paceHorse
    }
  }

  toggleCarrot () {
    this.props.dispatch(functional.toggleRideCarrot(this.props.ride.get('_id')))
  }

  render() {
    logRender('RideContainer')
    return (
      <Ride
        horses={this.props.horses}
        horsePhotos={this.props.horsePhotos}
        horseOwnerIDs={viewHorseOwnerIDs(this.props.horseUsers)}
        logError={this.logError}
        logInfo={this.logInfo}
        modalOpen={this.state.modalOpen}
        newComment={this.state.newComment}
        paceHorse={this.memoPaceHorse(this.props.horses, this.props.rideHorses)}
        ride={this.props.ride}
        rideUser={this.props.rideUser}
        rideCarrots={this.memoRideCarrots(this.props.rideCarrots)}
        rideComments={this.memoRideComments(this.props.rideComments)}
        rideCoordinates={this.props.rideCoordinates}
        rideElevations={this.props.rideElevations}
        rideHorses={this.memoRideHorses(this.props.rideHorses)}
        ridePhotos={this.memoThisRidesPhotos(this.props.ridePhotos)}
        showFullscreenMap={this.showFullscreenMap}
        showHorseProfile={this.showHorseProfile}
        showPhotoLightbox={this.showPhotoLightbox}
        showProfile={this.showProfile}
        skipToComments={this.props.skipToComments}
        submitComment={this.submitComment}
        toggleCarrot={this.toggleCarrot}
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
  const rideElevations = pouchState.get('selectedRideElevations')
  const userID = localState.get('userID')
  return {
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    notifications: pouchState.get('notifications'),
    ride,
    rideCarrots: pouchState.get('rideCarrots'),
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
