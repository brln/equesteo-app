import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { BackHandler } from 'react-native'

import {
  createRide,
  discardCurrentRide,
  pauseLocationTracking,
  startRide,
  stashNewLocations,
  stopStashNewLocations,
  unpauseLocationTracking,
} from '../actions/standard'
import {
  startLocationTracking,
  stopLocationTracking,
} from '../actions/functional'
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
      showGPSBar: true,
      discardModalOpen: false,
      navDebounce: false,
      _isMounted: false,
    }

    this.backToFeed = this.backToFeed.bind(this)
    this.closeDiscardModal = this.closeDiscardModal.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.goBack = this.goBack.bind(this)
    this.handleBackPress = this.handleBackPress.bind(this)
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

  handleBackPress () {
    this.goBack()
    return true
  }

  goBack () {
    this.setState({
      _isMounted: false
    })
    return Navigation.pop(this.props.componentId)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.lastLocation && !this.gpsTimeout) {
      this.gpsTimeout = setTimeout(() => {
        if (this.state._isMounted) {
          this.setState({showGPSBar: false})
        }
      }, 2000)
    }
  }

  componentWillUnmount () {
    this.setState({
      _isMounted: false
    })
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    clearTimeout(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (!this.state.navDebounce && this.state._isMounted) {
      this.setState({
        navDebounce: true
      })
      let nextScreen
      if (buttonId === 'finishRide') {
        nextScreen = this.finishRide()
      } else if (buttonId === 'back') {
        nextScreen = this.goBack()
      }
      nextScreen.then(() => {
        if (this.state._isMounted) {
          this.setState({
            navDebounce: false
          })
        }
      })
    }
  }

  componentWillMount() {
    if (!this.props.currentRide) {
      this.startRide()
    }
  }

  componentDidMount () {
    this.setState({
      _isMounted: true
    })
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
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
      }).then(() => {
        return this.props.dispatch(startLocationTracking())
      }).catch(e => {
        this.backToFeed()
      })
    } else {
      this.props.dispatch(startLocationTracking()).then(() => {
        this.startRide()
      })
    }
  }

  closeDiscardModal () {
    if (this.state._isMounted) {
      this.setState({
        discardModalOpen: false
      })
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
      return this.showUpdateRide()
    } else {
      return new Promise((res) => {
        if (this.state._isMounted) {
          this.setState({
            discardModalOpen: true
          }, res())
        }
      })

    }
  }

  discardRide () {
    Navigation.popToRoot(this.props.componentId).then(() => {
      this.props.dispatch(discardCurrentRide())
      this.props.dispatch(stopLocationTracking())
    })
  }

  showUpdateRide () {
    const rideID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
    this.props.dispatch(createRide(
      rideID,
      this.props.userID,
      this.props.currentRide,
      this.props.currentRideElevations,
      this.props.currentRideCoordinates,
      this.props.currentRidePhotos,
    ))
    return Navigation.push(this.props.componentId, {
      component: {
        name: UPDATE_RIDE,
        id: UPDATE_NEW_RIDE_ID,
        passProps: {
          rideID,
          newRide: true,
          currentRidePhotos: this.props.currentRidePhotos.keySeq().toList(),
        }
      }
    })
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
        nullMapLocation={this.props.nullMapLocation}
        refiningLocation={this.props.refiningLocation}
        pauseLocationTracking={this.pauseLocationTracking}
        showCamera={this.showCamera}
        showGPSBar={this.state.showGPSBar}
        showUpdateRide={this.showUpdateRide}
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
    activeComponent: localState.get('activeComponent'),
    appState: localState.get('appState'),
    currentRide: currentRideState.get('currentRide'),
    currentRideElevations: currentRideState.get('currentRideElevations'),
    currentRideCoordinates: currentRideState.get('currentRideCoordinates'),
    currentRidePhotos: localState.getIn(['ridePhotoStash', 'currentRide']) || Map(),
    horseUsers: pouchState.get('horseUsers'),
    lastElevation: currentRideState.get('lastElevation'),
    lastLocation: currentRideState.get('lastLocation'),
    nullMapLocation: currentRideState.get('nullMapLocation'),
    refiningLocation: currentRideState.get('refiningLocation'),
    user: pouchState.getIn(['users', userID]),
    userID,
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
