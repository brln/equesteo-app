import React from 'react'
import { connect } from 'react-redux';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native'
import {
  Card,
  CardItem,
} from 'native-base'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Navigation } from 'react-native-navigation'

import BackgroundComponent from '../components/BackgroundComponent'
import { darkBrand } from '../colors'
import { brand } from '../colors'
import { persistUserUpdate } from '../actions/functional'
import { userUpdated } from '../actions/standard'
import { EqNavigation } from '../services'
import EqPicker from '../components/EqPicker'
import Amplitude, {
  DISABLE_GPS_SOUND_ALERTS,
  ENABLE_HOOF_TRACKS,
  MAKE_RIDES_DEFAULT_PRIVATE,
  OPT_OUT_OF_LEADERBOARDS,
  TURN_ON_DISTANCE_ALERTS,
} from "../services/Amplitude"

class SettingsContainer extends BackgroundComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        title: {
          color: 'white',
          fontSize: 20,
          text: "Settings"
        },
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
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
      cachedUser: null,
      doRevert: true,
    }
    this.alertDistance = this.alertDistance.bind(this)
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.changeAlertDistance = this.changeAlertDistance.bind(this)
    this.changeEnableGPSAlerts = this.changeEnableGPSAlerts.bind(this)
    this.changeEnableDistanceAlerts = this.changeEnableDistanceAlerts.bind(this)
    this.changeLeaderboardOptOut = this.changeLeaderboardOptOut.bind(this)
    this.changeDefaultPublic = this.changeDefaultPublic.bind(this)
    this.distancePicker = this.distancePicker.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)

    Navigation.events().bindComponent(this);
  }

  static getDerivedStateFromProps (props, state) {
    if (!state.cachedUser && props.user) {
      return {
        cachedUser: props.user,
      }
    }
    return state
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
      EqNavigation.pop(this.props.componentId).catch(() => {})
      this.props.dispatch(persistUserUpdate(this.props.user.get('_id'), []))
      this.setState({
        doRevert: false,
      })
    }
  }

  componentWillUnmount () {
    if (this.state.doRevert) {
      this.props.dispatch(userUpdated(this.state.cachedUser))
    }
  }

  changeAccountDetails (user) {
    this.props.dispatch(userUpdated(user))
  }

  changeLeaderboardOptOut () {
    const newVal = !this.props.user.get('leaderboardOptOut')
    if (newVal) {
      Amplitude.logEvent(OPT_OUT_OF_LEADERBOARDS)
    }
    this.changeAccountDetails(this.props.user.set('leaderboardOptOut', newVal))
  }

  changeDefaultPublic () {
    const newVal = !this.props.user.get('ridesDefaultPublic')
    if (!newVal) {
      Amplitude.logEvent(MAKE_RIDES_DEFAULT_PRIVATE)
    }
    this.changeAccountDetails(this.props.user.set('ridesDefaultPublic', newVal))
  }

  changeEnableDistanceAlerts () {
    let userToUpdate = this.props.user
    const newVal = !this.props.user.get('enableDistanceAlerts')
    if (newVal && !this.props.user.get('alertDistance')) {
      userToUpdate = userToUpdate.set('alertDistance', 1)
    }
    if (newVal) {
      Amplitude.logEvent(TURN_ON_DISTANCE_ALERTS)
    }
    this.changeAccountDetails(userToUpdate.set('enableDistanceAlerts', newVal))
  }

  changeEnableGPSAlerts () {
    const newVal = !this.props.user.get('disableGPSAlerts')
    if (!newVal) {
      Amplitude.logEvent(DISABLE_GPS_SOUND_ALERTS)
    }
    this.changeAccountDetails(this.props.user.set('disableGPSAlerts', newVal))
  }

  changeAlertDistance (value) {
    this.changeAccountDetails(this.props.user.set('alertDistance', value))
  }

  distancePicker (onValueChange) {
    const items = [
      {label: '', value: null},
      {label: "1 mi", value: 1},
      {label: "2 mi", value: 2},
      {label: "3 mi", value: 3},
      {label: "4 mi", value: 4},
      {label: "5 mi", value: 5},
      {label: "10 mi", value: 10},
    ]
    return (
      <View style={{flex: 1}}>
        <EqPicker
          value={this.props.user.get('alertDistance')}
          items={items}
          onValueChange={onValueChange}
          width={100}
        />
      </View>
    )
  }

  alertDistance () {
    if (this.props.user.get('enableDistanceAlerts')) {
      return (
        <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 6, justifyContent: 'center'}}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 30}}>
                <Text>Alert every: </Text>
                { this.distancePicker(this.changeAlertDistance) }
              </View>
            </View>
          </View>
        </CardItem>
      )
    }
  }

  render() {
    return (
      <View>
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
          <Card>
            <CardItem header>
              <Text style={{color: darkBrand }}>Privacy:</Text>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.switch}>
                  <Switch
                    value={this.props.user.get('ridesDefaultPublic')}
                    onValueChange={this.changeDefaultPublic}
                  />
                </View>
                <View style={{flex: 6, justifyContent: 'center'}}>
                  <Text>Default my rides to publicly viewable.</Text>
                </View>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.switch}>
                  <Switch
                    value={this.props.user.get('leaderboardOptOut')}
                    onValueChange={this.changeLeaderboardOptOut}
                  />
                </View>
                <View style={{flex: 6, justifyContent: 'center'}}>
                  <Text>Opt-out of leaderboards.</Text>
                </View>
              </View>
            </CardItem>
          </Card>

          <Card>
            <CardItem header>
              <Text style={{color: darkBrand }}>Sounds:</Text>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.switch}>
                  <Switch
                    value={this.props.user.get('enableDistanceAlerts')}
                    onValueChange={this.changeEnableDistanceAlerts}
                  />
                </View>
                <View style={{flex: 6, justifyContent: 'center'}}>
                  <Text>Play distance alerts.</Text>
                </View>
              </View>
            </CardItem>

            { this.alertDistance() }


            <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.switch}>
                  <Switch
                    value={this.props.user.get('disableGPSAlerts')}
                    onValueChange={this.changeEnableGPSAlerts}
                  />
                </View>
                <View style={{flex: 6, justifyContent: 'center'}}>
                  <Text>Disable gps alerts.</Text>
                </View>
              </View>
            </CardItem>
          </Card>
        </KeyboardAwareScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  switch: {
    flex: 1,
    marginRight: Platform.select({ios: 20, android: 0}),
  },
});

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')
  return {
    activeComponent: localState.get('activeComponent'),
    user: pouchState.getIn(['users', userID])
  }
}

export default connect(mapStateToProps)(SettingsContainer)
