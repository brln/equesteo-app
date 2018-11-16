import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  createRide,
  discardCurrentRide,
  pauseLocationTracking,
  startRide,
  startLocationTracking,
  stashNewLocations,
  stopLocationTracking,
  stopStashNewLocations,
  unpauseLocationTracking,
} from '../actions'
import { brand } from '../colors'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { isAndroid, logRender, unixTimeNow } from '../helpers'
import { CAMERA, UPDATE_RIDE, UPDATE_NEW_RIDE_ID } from "../screens"

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
    this.showCamera = this.showCamera.bind(this)
    this.showUpdateRide = this.showUpdateRide.bind(this)
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

  showCamera () {
    Navigation.push(this.props.componentId, {
      component: {
        name: CAMERA,
        id: CAMERA,
      }
    })
  }

  finishRide () {
    if (this.props.currentRideCoordinates.get('rideCoordinates').count() > 0) {
      this.props.dispatch(stashNewLocations())
      this.showUpdateRide()
    } else {
      this.setState({
        discardModalOpen: true
      })
    }
  }

  discardRide () {
    this.props.dispatch(discardCurrentRide())
    this.props.dispatch(stopLocationTracking())
    Navigation.popToRoot(this.props.componentId)
  }

  showUpdateRide () {
    const rideID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
    this.props.dispatch(createRide(
      rideID,
      this.props.userID,
      this.props.currentRide,
      this.props.currentRideElevations,
      this.props.currentRideCoordinates,
    ))
    Navigation.push(this.props.componentId, {
      component: {
        name: UPDATE_RIDE,
        id: UPDATE_NEW_RIDE_ID,
        passProps: { rideID, newRide: true }
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
        currentRideCoordinates={this.props.currentRideCoordinates}
        currentRideElevations={this.props.currentRideElevations}
        discardRide={this.discardRide}
        discardModalOpen={this.state.discardModalOpen}
        lastElevation={this.props.lastElevation}
        lastLocation={this.props.lastLocation}
        refiningLocation={this.props.refiningLocation}
        pauseLocationTracking={this.pauseLocationTracking}
        showCamera={this.showCamera}
        showGPSBar={this.state.showGPSBar}
        showUpdateRide={this.showUpdateRide}
        startRide={this.startRide}
        unpauseLocationTracking={this.unpauseLocationTracking}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const currentRideState = state.get('currentRide')
  const userID = localState.get('userID')
  return {
    appState: localState.get('appState'),
    currentRide: currentRideState.get('currentRide'),
    currentRideElevations: currentRideState.get('currentRideElevations'),
    currentRideCoordinates: currentRideState.get('currentRideCoordinates'),
    lastElevation: currentRideState.get('lastElevation'),
    lastLocation: currentRideState.get('lastLocation'),
    refiningLocation: currentRideState.get('refiningLocation'),
    user: pouchState.getIn(['users', userID]),
    userID,
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
