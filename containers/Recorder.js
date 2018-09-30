import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  discardRide,
  startRide,
  startLocationTracking,
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
        backButton: {
          color: 'white'
        }
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      showGPSBar: true,
      gpsBarShown: false
    }

    this.backToFeed = this.backToFeed.bind(this)
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
    if (nextProps.lastLocation && !this.state.gpsBarShown) {
      this.gpsTimeout = setTimeout(() => {
        this.setState({showGPSBar: false, gpsBarShown: true})
      }, 2000)
    }
  }

  componentWillUnmount () {
    console.log('CLEARING gpsTimeout in RecorderContainer')
    clearInterval(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'finishRide') {
      this.finishRide()
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
    this.props.dispatch(startRide(this.props.lastLocation))
  }

  finishRide () {
    if (this.props.currentRide.get('rideCoordinates').count() > 0) {
      this.showRideDetails()
    } else {
      alert('Discarding empty ride.')
      this.props.discardRide()
    }
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
    lastLocation: localState.get('lastLocation'),
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
