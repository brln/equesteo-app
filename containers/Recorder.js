import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  discardRide,
  pauseLocationTracking,
  startRide,
  startLocationTracking,
  stopLocationTracking,
  stopStashNewLocations,
  unpauseLocationTracking,
} from '../actions'
import { brand } from '../colors'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { elapsedTime, isAndroid, logRender, unixTimeNow } from '../helpers'
import { RIDE_DETAILS } from "../screens"

class RecorderContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      showGPSBar: !props.currentRide,
      discardModalOpen: false,
    }

    this.backToFeed = this.backToFeed.bind(this)
    this.closeDiscardModal = this.closeDiscardModal.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.finishRide = this.finishRide.bind(this)
    this.pauseLocationTracking = this.pauseLocationTracking.bind(this)
    this.showRideDetails = this.showRideDetails.bind(this)
    this.startRide = this.startRide.bind(this)
    this.unpauseLocationTracking = this.unpauseLocationTracking.bind(this)

    Navigation.events().bindComponent(this);

    if (props.currentRide) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'finishRide',
              text: 'Finish Ride',
              color: 'white'
            },
          ]
        }
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.lastLocation && !this.gpsTimeout) {
      this.gpsTimeout = setTimeout(() => {
        this.setState({showGPSBar: false})
      }, 2000)
    }
  }

  componentWillUnmount () {
    clearInterval(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'finishRide') {
      this.finishRide()
    } else if (buttonId === 'back') {
      if (!this.props.currentRide) {
        this.props.dispatch(stopLocationTracking())
      }
      Navigation.pop(this.props.componentId)
    }
  }

  componentDidMount () {
    if (isAndroid()) {
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "You need to turn on the GPS and enable 'High Accuracy' to record your ride. \nPlease do so and then come back.",
        ok: "OK",
        cancel: "Nope",
        enableHighAccuracy: true,
        showDialog: true,
        openLocationServices: true,
        preventOutSideTouch: false,
        preventBackClick: true,
        providerListener: false,
      }).then(
        this.props.dispatch(startLocationTracking())
      ).catch(
        this.backToFeed
      );
    } else {
      this.props.dispatch(startLocationTracking())
    }
  }

  closeDiscardModal () {
    this.setState({
      discardModalOpen: false
    })
  }

  backToFeed () {
    Navigation.popToRoot(this.props.componentId)
  }

  startRide () {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [
          {
            id: 'finishRide',
            text: 'Finish Ride',
            color: 'white'
          },
        ]
      }
    })
    this.props.dispatch(stopStashNewLocations())
    this.props.dispatch(startRide(this.props.lastLocation, this.props.lastElevation, unixTimeNow()))
  }

  finishRide () {
    if (this.props.currentRide.get('rideCoordinates').count() > 0) {
      this.showRideDetails()
    } else {
      this.setState({
        discardModalOpen: true
      })
    }
  }

  discardRide () {
    this.props.dispatch(discardRide())
    this.props.dispatch(stopLocationTracking())
    Navigation.popToRoot(this.props.componentId)
  }

  showRideDetails () {
    const startTime = this.props.currentRide.get('startTime')
    const now = new Date()
    const elapsed = elapsedTime(
      startTime,
      now,
      this.props.currentRide.get('pausedTime'),
      this.props.currentRide.get('lastPauseStart')
    )
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE_DETAILS,
        passProps: { elapsedTime: elapsed }
      }
    });
  }

  pauseLocationTracking () {
    this.props.dispatch(pauseLocationTracking())
  }

  unpauseLocationTracking () {
    this.props.dispatch(unpauseLocationTracking())
  }

  render() {
    logRender('RecorderContainer')
    return (
      <RideRecorder
        appState={this.props.appState}
        closeDiscardModal={this.closeDiscardModal}
        currentRide={this.props.currentRide}
        currentRideElevations={this.props.currentRideElevations}
        discardRide={this.discardRide}
        discardModalOpen={this.state.discardModalOpen}
        lastElevation={this.props.lastElevation}
        lastLocation={this.props.lastLocation}
        refiningLocation={this.props.refiningLocation}
        pauseLocationTracking={this.pauseLocationTracking}
        showGPSBar={this.state.showGPSBar}
        showRideDetails={this.showRideDetails}
        startRide={this.startRide}
        unpauseLocationTracking={this.unpauseLocationTracking}
      />
    )
  }
}

function mapStateToProps (state) {
  const localState = state.get('localState')
  const currentRideState = state.get('currentRide')
  return {
    appState: localState.get('appState'),
    currentRide: currentRideState.get('currentRide'),
    currentRideElevations: currentRideState.get('currentRideElevations'),
    lastElevation: currentRideState.get('lastElevation'),
    lastLocation: currentRideState.get('lastLocation'),
    refiningLocation: currentRideState.get('refiningLocation'),
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
