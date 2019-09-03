import React, { PureComponent } from 'react'
import {connect} from "react-redux"
import {
  StyleSheet,
  Text, View,
} from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation-android'

import Button from '../components/Button'
import {brand, lightGrey} from "../colors"
import BuildImage from "../components/Images/BuildImage"
import {EqNavigation} from "../services"
import {RECORDER} from "../screens/consts/main"


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
  }

  doPermissions () {
    BackgroundGeolocation.getCurrentPosition().then(() => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: RECORDER,
          id: RECORDER
        }
      })
    }).catch(e => {
      EqNavigation.popToRoot(this.props.componentId)
    })
  }

  text () {
    if (this.props.response === 'undetermined') {
      return (
        <View style={{flex: 1, padding: 20}}>
          <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location with the screen off you need to enable the 'Always' location permission.</Text>
          <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>We only track your location while you're on a ride.</Text>
          <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please tap 'Next' then select 'Always Allow'.</Text>
          <View style={{padding: 20}}>
            <Button color={brand} onPress={this.doPermissions} text={'Next'}/>
          </View>
        </View>
      )
    } else if (this.props.response === 'denied' || this.props.response === 'restricted') {
      return (
        <View style={{flex: 1, padding: 20}}>
          <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>For Equesteo to track your location with the screen off you need to enable the 'Always' location permission.</Text>
          <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>You previously denied this permission, or set it to "When Using" and we can't set it for you now.</Text>
          <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>Please go into Equesteo in your device settings and change the location permission to 'Always'.</Text>
        </View>
      )
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
              width: 120,
              height: 120,
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
    flex: 1,
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
