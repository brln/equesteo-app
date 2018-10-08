import React, { PureComponent } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { brand, lightGrey } from '../colors'
import { RELEASE } from 'react-native-dotenv'

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
  }

  close () {
    this.props.close()
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
          <Image
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
          <View style={{flex: 1}}>
            <Text>Made with ♡ in Ben Lomond, CA</Text>
          </View>
          <View style={{flex: 3}}>
            <Text>Version { RELEASE.split('-')[1] }</Text>
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
});