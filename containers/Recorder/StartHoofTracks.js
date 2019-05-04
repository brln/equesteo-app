import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { BackHandler } from 'react-native'
import { View, Text } from 'react-native'

import {
  setHoofTracksID,
} from '../../actions/standard'
import { brand, danger } from '../../colors'
import { EqNavigation, UserAPI } from '../../services'
import Button from '../../components/Button'

class StartHoofTracksContainer extends PureComponent {
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
            id: 'startTracks',
            text: 'Start',
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

    this.goBack = this.goBack.bind(this)
    this.handleBackPress = this.handleBackPress.bind(this)
    this.fetchHTID = this.fetchHTID.bind(this)

    Navigation.events().bindComponent(this);
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
    clearTimeout(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'finishRide') {
    }
  }

  fetchHTID () {
    return UserAPI.getHoofTracksID().then((resp) => {
      this.props.dispatch(setHoofTracksID(resp.htID))
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 3, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20, marginTop: 20}}>
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center'}}>Your ride will be broadcast live with ID:</Text>
          </View>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Text style={{fontFamily: 'courier', fontSize: 25, textAlign: 'center'}}>{this.props.hoofTracksID}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
                <View style={{marginRight: 10 }}>
                  <Button text={"Share"} color={danger} onPress={() => {}}/>
                </View>
                <View style={{marginLeft: 10}} >
                  <Button text={"Reset Code"} color={brand} onPress={() => {}}/>
                </View>
              </View>
            </View>
          </View>
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center'}}>Anyone with this id can follow your ride at http://equesteo.com/hoofTracks</Text>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
            <View style={{marginRight: 10 }}>
              <Button text={"Start"} color={danger} onPress={this.props.startHoofTracks}/>
            </View>
            <View style={{marginLeft: 10}} >
              <Button text={"Cancel"} color={brand} onPress={this.cancel}/>
            </View>
          </View>
        </View>
      </View>
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

export default  connect(mapStateToProps)(StartHoofTracksContainer)
