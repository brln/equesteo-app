import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  discardRide,
  stopLocationTracking,
  startRide,
  startLocationTracking
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
        backButton: {
          color: 'white'
        }
      }
    };
  }

  constructor (props) {
    super(props)
    this.backToFeed = this.backToFeed.bind(this)
    this.componentDidDisappear = this.componentDidDisappear.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.showRideDetails = this.showRideDetails.bind(this)
    this.startRide = this.startRide.bind(this)
    this.startLocationTracking = this.startLocationTracking.bind(this)
    this.stopLocationTracking = this.stopLocationTracking.bind(this)

    Navigation.events().bindComponent(this);
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
        this.startLocationTracking
      ).catch(
        this.backToFeed
      );
    } else {
      this.startLocationTracking()
    }
  }

  componentDidDisappear () {
    if (!this.props.currentRide) {
      this.stopLocationTracking()
    }
  }

  backToFeed () {
    Navigation.popToRoot(this.props.componentId)
  }

  startLocationTracking () {
    this.props.dispatch(startLocationTracking())
  }

  stopLocationTracking () {
    this.props.dispatch(stopLocationTracking())
  }

  startRide () {
    this.props.dispatch(startRide(this.props.lastLocation))
  }

  discardRide () {
    this.props.dispatch(discardRide())
    Navigation.popToRoot(this.props.componentId)
  }

  showRideDetails () {
    const elapsedTime = (unixTimeNow() - this.props.currentRide.get('startTime')) / 1000
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE_DETAILS,
        id: RIDE_DETAILS,
        passProps: { elapsedTime }
      }
    });
  }

  render() {
    logRender('RecorderContainer')
    return (
      <RideRecorder
        appState={this.props.appState}
        currentRide={this.props.currentRide}
        discardRide={this.discardRide}
        lastLocation={this.props.lastLocation}
        showRideDetails={this.showRideDetails}
        startRide={this.startRide}
        stopLocationTracking={this.stopLocationTracking}
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
    lastLocation: localState.get('lastLocation'),
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
