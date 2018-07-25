import React, { Component } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  changeScreen,
  discardRide,
  stopLocationTracking,
  startRide,
  startLocationTracking
} from '../actions'
import RideRecorder from '../components/RideRecorder/RideRecorder'
import { FEED } from '../screens'
import NavigatorComponent from './NavigatorComponent'

class RecorderContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.backToFeed = this.backToFeed.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.startRide = this.startRide.bind(this)
    this.startLocationTracking = this.startLocationTracking.bind(this)
    this.stopLocationTracking = this.stopLocationTracking.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentDidMount () {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: "You need to turn on the GPS to record your ride. \nPlease do so and then come back.",
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
  }

  onNavigatorEvent (event) {
    if (event.id === 'willDisappear' && event.type === 'ScreenChangedEvent') {
      this.props.dispatch(changeScreen(FEED))
      if (!this.props.currentRide) {
        this.stopLocationTracking()
      }
    }
  }

  backToFeed () {
    this.props.dispatch(changeScreen(FEED))
    this.props.navigator.popToRoot()
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
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(FEED))
  }

  render() {
    console.log('rendering RecorderContainer')
    return (
      <RideRecorder
        appState={this.props.appState}
        currentRide={this.props.currentRide}
        discardRide={this.discardRide}
        horses={this.props.horses}
        lastLocation={this.props.lastLocation}
        navigator={this.props.navigator}
        startRide={this.startRide}
        stopLocationTracking={this.stopLocationTracking}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    appState: state.getIn(['main', 'localState', 'appState']),
    currentRide: state.getIn(['main', 'localState', 'currentRide']),
    horses: state.getIn(['main', 'horses']).toList(),
    lastLocation: state.getIn(['main', 'localState', 'lastLocation'])
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
