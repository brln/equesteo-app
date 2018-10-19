import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  discardRide,
  startRide,
  startLocationTracking,
  stopLocationTracking,
  unpauseLocationTracking,
} from '../actions'
import { brand } from '../colors'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { isAndroid, logRender, unixTimeNow } from '../helpers'
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
    this.showRideDetails = this.showRideDetails.bind(this)
    this.startRide = this.startRide.bind(this)

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
    this.props.dispatch(unpauseLocationTracking())
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
    const elapsedTime = (unixTimeNow() - this.props.currentRide.get('startTime')) / 1000
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE_DETAILS,
        passProps: { elapsedTime }
      }
    });
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
        moving={this.props.moving}
        refiningLocation={this.props.refiningLocation}
        showGPSBar={this.state.showGPSBar}
        showRideDetails={this.showRideDetails}
        startRide={this.startRide}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    appState: localState.get('appState'),
    currentRide: localState.get('currentRide'),
    currentRideElevations: localState.get('currentRideElevations'),
    lastElevation: localState.get('lastElevation'),
    lastLocation: localState.get('lastLocation'),
    refiningLocation: localState.get('refiningLocation'),
    moving: localState.get('moving')
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
