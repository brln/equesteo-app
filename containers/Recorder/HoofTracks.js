import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { BackHandler } from 'react-native'
import { Alert, Share, Text, TextInput, View } from 'react-native'

import {
  setHoofTracksID,
  setHoofTracksLastUpload,
} from '../../actions/standard'
import { brand, danger, darkBrand } from '../../colors'
import { EqNavigation, UserAPI } from '../../services'
import Button from '../../components/Button'
import {
  startHoofTracksDispatcher,
  stopHoofTracksDispatcher
} from "../../actions/functional"

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
      this.props.dispatch(startHoofTracksDispatcher())
      EqNavigation.pop(this.props.componentId)
    } else if (buttonId === 'stopTracks') {
      this.props.dispatch(stopHoofTracksDispatcher())
      EqNavigation.pop(this.props.componentId)
    }
  }

  componentWillMount () {
    return UserAPI.getHoofTracksID().then((resp) => {
      this.props.dispatch(setHoofTracksID(resp.htID))
    })
  }

  shareLink () {
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
              this.props.dispatch(setHoofTracksID(resp.htID))
            }))
          },
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
    let mainText = "Your ride will be broadcast live with ID:"
    if (this.props.hoofTracksRunning) {
      mainText = "Your ride is currently broadcasting with ID: "
    }
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20, marginTop: 20}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={{textAlign: 'center'}}>{ mainText }</Text>
          </View>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Text style={{fontFamily: 'courier', fontSize: 40, textAlign: 'center'}}>{this.props.hoofTracksID}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
                <View style={{marginRight: 10}} >
                  <Button text={"Reset Code"} color={danger} onPress={this.resetCode}/>
                </View>
                <View style={{marginLeft: 10 }}>
                  <Button text={"Share"} color={brand} onPress={this.shareLink}/>
                </View>
              </View>
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{marginBottom: 10}}>
              <Text style={{textAlign: 'center'}}>Anyone with this id can follow your ride at: </Text>
            </View>
            <TextInput
              style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
              selectTextOnFocus={true}
              underlineColorAndroid={'transparent'}
              value={`https://equesteo.com/hoofTracks?c=${this.props.hoofTracksID}`}
            />
          </View>
        </View>
      </View>
    )
  }
}

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    hoofTracksID: localState.get('hoofTracksID'),
    hoofTracksRunning: localState.get('hoofTracksRunning'),
  }
}

export default  connect(mapStateToProps)(HoofTracksContainer)
