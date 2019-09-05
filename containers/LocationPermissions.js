import React, { PureComponent } from 'react'
import {connect} from "react-redux"
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation-android'

import Button from '../components/Button'
import {brand, lightGrey} from "../colors"
import BuildImage from "../components/Images/BuildImage"
import {EqNavigation} from "../services"
import {RECORDER} from "../screens/consts/main"
import Permissions, {PERMISSIONS} from "react-native-permissions"


class LocationPermissions extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Permission",
          color: 'white',
          fontSize: 20
        },
        backButton: {
          color: 'white',
        },
        background: {
          color: brand,
        },
        elevation: 0
      }
    };
  }

  constructor (props) {
    super(props)
    this.doPermissions = this.doPermissions.bind(this)
    this.iosSettings = this.iosSettings.bind(this)
  }

  iosSettings () {
    Linking.openURL('app-settings://')
    EqNavigation.popToRoot(this.props.componentId)
  }

  doPermissions () {
    BackgroundGeolocation.getCurrentPosition().then(() => {
      Permissions.check(Platform.select({android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, ios: PERMISSIONS.IOS.LOCATION_ALWAYS})).then(response => {
        if (response === 'granted') {
          EqNavigation.push(this.props.componentId, {
            component: {
              name: RECORDER,
              id: RECORDER
            }
          })
        } else {
          EqNavigation.popToRoot(this.props.componentId)
        }
      })
    }).catch(e => {
      if (e === 1) {
        EqNavigation.popToRoot(this.props.componentId)
      }
    })
  }

  text () {
    console.log(this.props.response)
    if (this.props.response === 'denied') {
      return Platform.select({
        ios: (
            <View style={{flex: 1, padding: 20}}>
              <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location with the screen off you need to enable the 'Always' location permission.</Text>
              <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>If you choose 'When in Use', iOS will randomly kill the app when the screen is off.</Text>
              <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>We only track your location while you're on a ride.</Text>
              <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>Watch for the little arrow on the top bar to know if tracking is active.</Text>
              <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please tap 'Next' then select</Text>
              <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 0}}>'Always Allow'.</Text>
              <View style={{padding: 20}}>
                <Button color={brand} onPress={this.doPermissions} text={'Next'}/>
              </View>
            </View>
          ),
        android: (
          <View style={{flex: 1, padding: 20}}>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location you need to enable location permissions.</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>If you have granted permission but your phone can't find you, you may need to go into 'Settings' and turn on "Google Location Accuracy".</Text>
            <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please tap 'Next' then select 'Allow'.</Text>
            <View style={{padding: 20}}>
              <Button color={brand} onPress={this.doPermissions} text={'Next'}/>
            </View>
          </View>
        ),
      })
    } else if (this.props.response === 'unavailable' || this.props.response === 'blocked') {
      return Platform.select({
        ios: (
          <View style={{flex: 1, padding: 20}}>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location with the screen off you need to enable the 'Always' location permission.</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>You previously denied this permission, or set it to "When Using" and we can't set it for you now.</Text>
            <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please go into your device settings and change the location permission to 'Always'.</Text>
            <Button color={brand} onPress={this.iosSettings} text={'Settings'}/>
          </View>
        ),
        android: (
          <View style={{flex: 1, padding: 20}}>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location with the screen off you need to enable location permissions.</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>You denied this permission at some point.</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>If you choose 'When in Use', iOS will randomly kill the app when the screen is off.</Text>
            <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please go into your device settings and change the location permission to 'Allow'.</Text>
          </View>
        ),
      })
    }
  }

  render() {
    return (
      <View style={{height: '100%'}}>
        <View style={{
          flex: 1,
          backgroundColor: lightGrey,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <BuildImage
            source={require('../img/logo250.png')}
            style={{
              width: 80,
              height: 80,
              alignItems: 'center',
            }}
          />
          <Text style={{
            fontFamily: 'Panama-Light',
            fontSize: 30,
            color: 'black',
          }}>
            Equesteo
          </Text>
        </View>
        <View style={styles.container}>
          { this.text() }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightGrey,
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

function mapStateToProps (state, passedProps) {
  return {
    response: passedProps.response
  }
}

export default connect(mapStateToProps)(LocationPermissions)
