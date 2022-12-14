import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Alert, BackHandler } from 'react-native'

import {
  createRide,
  discardCurrentRide,
  pauseLocationTracking,
  setActiveAtlasEntry,
  setHoofTracksRunning,
  startRide,
  stashNewLocations,
  stopStashNewLocations,
  unpauseLocationTracking,
} from '../../actions/standard'
import functional from '../../actions/functional'
import { brand } from '../../colors'
import RideRecorder from '../../components/RideRecorder/RideRecorder'
import { logRender, rideIDGenerator, unixTimeNow } from '../../helpers'
import Amplitude, {
  DISCARD_EMPTY_RIDE,
  FINISH_RIDE,
  PAUSE_RIDE,
  RESUME_PAUSED_RIDE,
  TURN_OFF_RIDE_ATLAS_RIDE,
} from "../../services/Amplitude"
import {
  CAMERA,
  RIDE_ATLAS,
  START_HOOF_TRACKS,
  UPDATE_RIDE,
  UPDATE_NEW_RIDE_ID
} from "../../screens/consts/main"
import { EqNavigation } from '../../services'
import TimeoutManager from '../../services/TimeoutManager'

class RecorderContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white',
        },
        rightButtons: [
          {
            id: 'finishRide',
            text: 'Finish Ride',
            color: 'white'
          },
        ]
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
    }

    this.clearActiveAtlasEntry = this.clearActiveAtlasEntry.bind(this)
    this.discardRide = this.discardRide.bind(this)
    this.goBack = this.goBack.bind(this)
    this.handleBackPress = this.handleBackPress.bind(this)
    this.finishRide = this.finishRide.bind(this)
    this.pauseLocationTracking = this.pauseLocationTracking.bind(this)
    this.showAtlas = this.showAtlas.bind(this)
    this.showCamera = this.showCamera.bind(this)
    this.showUpdateRide = this.showUpdateRide.bind(this)
    this.startHoofTracks = this.startHoofTracks.bind(this)
    this.startRide = this.startRide.bind(this)
    this.unpauseLocationTracking = this.unpauseLocationTracking.bind(this)

    Navigation.events().bindComponent(this);

    if (!props.currentRide) {
      this.startRide()
    }
  }

  handleBackPress () {
    this.goBack()
    return true
  }

  goBack () {
    return EqNavigation.pop(this.props.componentId).catch(() => {})
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    TimeoutManager.deleteTimeout(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'finishRide') {
      this.finishRide()
    } else if (buttonId === 'back') {
      this.goBack()
    }
  }

  componentDidMount () {
    if (!this.gpsTimeout) {
      this.gpsTimeout = setInterval(() => {
        if (this.props.lastLocation) {
           clearInterval(this.gpsTimeout)
           this.gpsTimeout = TimeoutManager.newTimeout(() => {
              this.setState({showGPSBar: false})
           })
        }
      }, 2000)
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    this.props.dispatch(functional.startLocationTracking())

    if (this.props.hoofTracksRunning) {
      this.props.dispatch(setHoofTracksRunning(true))
    }
  }

  startHoofTracks () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: START_HOOF_TRACKS,
        id: START_HOOF_TRACKS
      }
    })
  }

  startRide () {
    this.props.dispatch(stopStashNewLocations())
    this.props.dispatch(startRide(this.props.lastLocation, this.props.lastElevation, unixTimeNow()))
  }

  showCamera () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: CAMERA,
        id: CAMERA,
      }
    }).catch(() => {})
  }

  showAtlas () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: RIDE_ATLAS,
        id: RIDE_ATLAS,
      }
    }).catch(() => {})
  }

  clearActiveAtlasEntry () {
    Amplitude.logEvent(TURN_OFF_RIDE_ATLAS_RIDE)
    this.props.dispatch(setActiveAtlasEntry(null))
  }

  finishRide () {
    Amplitude.logEvent(FINISH_RIDE)
    if (this.props.currentRideCoordinates.get('rideCoordinates').count() > 0) {
      this.props.dispatch(stashNewLocations())
      this.showUpdateRide()
    } else {
      Alert.alert(
        'Discard Ride',
        "You haven't gone anywhere on this ride yet. Do you want to close it?",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: this.discardRide,
            style: 'destructive'
          },
        ],
        {cancelable: true},
      )
    }
  }

  discardRide () {
    Amplitude.logEvent(DISCARD_EMPTY_RIDE)
    EqNavigation.popToRoot(this.props.componentId).then(() => {
      this.props.dispatch(discardCurrentRide())
      this.props.dispatch(functional.stopLocationTracking())
      this.props.dispatch(functional.stopHoofTracksDispatcher())
    }).catch(() => {})
  }

  showUpdateRide () {
    const rideID =  rideIDGenerator(this.props.userID)
    this.props.dispatch(createRide(
      rideID,
      this.props.userID,
      this.props.currentRide,
      this.props.currentRideElevations,
      this.props.currentRideCoordinates,
      null,
      this.props.user.get('ridesDefaultPublic')
    ))
    EqNavigation.push(this.props.componentId, {
      component: {
        name: UPDATE_RIDE,
        id: UPDATE_NEW_RIDE_ID,
        passProps: {
          rideID,
          newRide: true,
          currentRidePhotos: this.props.currentRidePhotos.keySeq().toList(),
        },
      }
    }).catch(() => {})
  }

  pauseLocationTracking () {
    Amplitude.logEvent(PAUSE_RIDE)
    this.props.dispatch(pauseLocationTracking())
  }

  unpauseLocationTracking () {
    Amplitude.logEvent(RESUME_PAUSED_RIDE)
    this.props.dispatch(unpauseLocationTracking())
  }

  render() {
    logRender('RecorderContainer')
    return (
      <RideRecorder
        activeAtlasEntry={this.props.activeAtlasEntry}
        appState={this.props.appState}
        clearActiveAtlasEntry={this.clearActiveAtlasEntry}
        currentRide={this.props.currentRide}
        currentRideCoordinates={this.props.currentRideCoordinates}
        currentRideElevations={this.props.currentRideElevations}
        discardRide={this.discardRide}
        discardModalOpen={this.state.discardModalOpen}
        gpsSignalLost={this.props.gpsSignalLost}
        hoofTracksID={this.props.hoofTracksID}
        hoofTracksRunning={this.props.hoofTracksRunning}
        lastElevation={this.props.lastElevation}
        lastLocation={this.props.lastLocation}
        nullMapLocation={this.props.nullMapLocation}
        refiningLocation={this.props.refiningLocation}
        pauseLocationTracking={this.pauseLocationTracking}
        showAtlas={this.showAtlas}
        showCamera={this.showCamera}
        showGPSBar={this.state.showGPSBar}
        showUpdateRide={this.showUpdateRide}
        startHoofTracks={this.startHoofTracks}
        unpauseLocationTracking={this.unpauseLocationTracking}
        user={this.props.user}
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
    activeAtlasEntry: pouchState.getIn(['rideAtlasEntries', localState.get('activeAtlasEntry')]),
    activeComponent: localState.get('activeComponent'),
    appState: localState.get('appState'),
    currentRide: currentRideState.get('currentRide'),
    currentRideElevations: currentRideState.get('currentRideElevations'),
    currentRideCoordinates: currentRideState.get('currentRideCoordinates'),
    currentRidePhotos: localState.getIn(['ridePhotoStash', 'currentRide']) || Map(),
    gpsSignalLost: localState.get('gpsSignalLost'),
    horseUsers: pouchState.get('horseUsers'),
    hoofTracksID: localState.get('hoofTracksID'),
    hoofTracksRunning: localState.get('hoofTracksRunning'),
    lastElevation: currentRideState.get('lastElevation'),
    lastLocation: currentRideState.get('lastLocation'),
    nullMapLocation: currentRideState.get('nullMapLocation'),
    refiningLocation: currentRideState.get('refiningLocation'),
    user: pouchState.getIn(['users', userID]),
    userID,
  }
}

export default  connect(mapStateToProps)(RecorderContainer)
