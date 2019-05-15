import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { BackHandler } from 'react-native'
import { ActivityIndicator, Alert, Share, Text, TextInput, View } from 'react-native'

import {
  setHoofTracksID,
  setHoofTracksLastUpload,
  setHoofTracksRunning,
} from '../../actions/standard'
import { brand } from '../../colors'
import { EqNavigation, UserAPI } from '../../services'
import {
  doHoofTracksUpload,
  stopHoofTracksDispatcher
} from "../../actions/functional"
import HoofTracksLive from '../../components/HoofTracks/HoofTracksLive'
import Amplitude, {
  ACTIVATE_HOOF_TRACKS,
  DEACTIVATE_HOOF_TRACKS,
  RESET_HOOF_TRACKS_CODE,
  SHARE_HOOF_TRACKS_CODE
} from "../../services/Amplitude"

class HoofTracksContainer extends PureComponent {
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
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      error: null
    }

    this.goBack = this.goBack.bind(this)
    this.handleBackPress = this.handleBackPress.bind(this)
    this.resetCode = this.resetCode.bind(this)
    this.shareLink = this.shareLink.bind(this)

    Navigation.events().bindComponent(this);

    if (props.hoofTracksRunning) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'stopTracks',
              text: 'Stop',
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
    return EqNavigation.pop(this.props.componentId).catch(() => {})
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    clearTimeout(this.gpsTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'startTracks') {
      Alert.alert(
        'Be Careful',
        'This feature is for convenience, not safety. Always tell someone where you plan to go and when you\'ll be back.\n\n As with all app-based trackers, if you lose cell service, your battery dies, or servers go down, your location will not be broadcast.\n\nEven though your ride will record without cell service, your location can\'t be broadcast without it.\n\nFor safety tracking, please buy a device intended for that purpose.',
        [
          {
            text: 'OK',
            onPress: () => {
              Amplitude.logEvent(ACTIVATE_HOOF_TRACKS)
              this.props.dispatch(setHoofTracksRunning(true))
              this.props.dispatch(doHoofTracksUpload())
              EqNavigation.pop(this.props.componentId)
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );


    } else if (buttonId === 'stopTracks') {
      Amplitude.logEvent(DEACTIVATE_HOOF_TRACKS)
      this.props.dispatch(stopHoofTracksDispatcher())
      EqNavigation.pop(this.props.componentId)
    }
  }

  componentWillMount () {
    return UserAPI.getHoofTracksID().then((resp) => {
      this.props.dispatch(setHoofTracksID(resp.htID))
      if (!this.props.hoofTracksRunning) {
        Navigation.mergeOptions(this.props.componentId, {
          topBar: {
            rightButtons: [
              {
                id: 'startTracks',
                text: 'Start',
                color: 'white'
              },
            ]
          }
        })
      }
    }).catch(e => {
      this.setState({
        error: 'Can\'t fetch HoofTracks ID. Maybe you\'re not online? Email us with problems. info@equesteo.com'
      })
    })
  }

  shareLink () {
    Amplitude.logEvent(SHARE_HOOF_TRACKS_CODE)
    Share.share({message: `https://equesteo.com/hoofTracks?c=${this.props.hoofTracksID}`, title: "Follow my track on Equesteo!"})
  }

  resetCode () {
    Alert.alert(
      'Reset Code',
      'If you reset the code, no one with the old code will be able to view your ride, and there\'s no way to get an old code back.',
      [
        {
          text: 'OK',
          onPress: () => {
            this.props.dispatch(setHoofTracksLastUpload(null))
            UserAPI.resetHoofTracksID().then((resp => {
              Amplitude.logEvent(RESET_HOOF_TRACKS_CODE)
              this.props.dispatch(setHoofTracksID(resp.htID))
            })).catch(e => {})
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }

  render() {
    if (this.props.hoofTracksID) {
      return (
        <HoofTracksLive
          hoofTracksRunning={this.props.hoofTracksRunning}
          hoofTracksID={this.props.hoofTracksID}
          lastHoofTracksUpload={this.props.lastHoofTracksUpload}
          resetCode={this.resetCode}
          shareLink={this.shareLink}
        />
      )
    } else if (this.state.error) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{textAlign: 'center'}}>{ this.state.error }</Text>
        </View>
      )
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
        </View>
      )
    }
  }
}

function mapStateToProps (state) {
  const localState = state.get('localState')
  const currentRideState = state.get('currentRide')
  return {
    hoofTracksID: localState.get('hoofTracksID'),
    hoofTracksRunning: localState.get('hoofTracksRunning'),
    lastHoofTracksUpload: currentRideState.get('lastHoofTracksUpload')
  }
}

export default  connect(mapStateToProps)(HoofTracksContainer)
