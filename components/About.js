import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';


import { brand, lightGrey } from '../colors'
import config from '../dotEnv'
import BuildImage from './Images/BuildImage'
import Button from './Button'
import {EqNavigation} from "../services"
import { LOCATION_LOG } from "../screens/consts/main"


export default class About extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "About",
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
    this.showLocationLog = this.showLocationLog.bind(this)

  }



  showLocationLog () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: LOCATION_LOG,
      }
    }).catch(() => {})
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
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text>Made with </Text>
            <TouchableWithoutFeedback onPress={() => {throw new Error('error test')}}><View><Text>♡</Text></View></TouchableWithoutFeedback>
            <Text> in Bend, OR</Text>
          </View>
          <View style={{flex: 3}}>
            <Text>Version { config.RELEASE.split('-')[1] }</Text>
          </View>

          <View style={{flex: 3}}>
            <Button
              text={"Location Log"}
              color={brand}
              onPress={this.showLocationLog}
            />
          </View>
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
