import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { black, brand } from '../../colors'
import { logError } from '../../helpers'

const { width } = Dimensions.get('window')
const calcWidth = (width / 2) - 41

export default class NewHorseButton extends PureComponent {
  render() {
    let source = require('../../img/emptyHorseBlack.png')
    return (
      <View
        elevation={5}
        style={{
          marginBottom: 20,
          backgroundColor: brand,
          shadowColor: black,
          shadowOffset: {
            width: 0,
            height: 3
          },
          shadowRadius: 5,
          shadowOpacity: 1.0
        }}
      >
        <TouchableOpacity
          onPress={this.props.newHorse}
        >
          <View
            title={''}
            style={{flex: 1}}
          >
            <View style={{flex: 1, alignItems: 'center', paddingBottom: 5}}>
              <BuildImage
                source={source}
                style={{height: calcWidth, width: calcWidth, margin: 10}}
                onError={e => logError("Can't load NewHorseButton image")}
              />
              <View style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                left: 5,
                right: 5,
                top: 5,
                bottom: 5,
                padding: 5
              }}>
                <Text style={{
                  textAlign: 'center',
                  fontSize: 20,
                  color: 'white',
                  textShadowColor: 'black',
                  textShadowRadius: 5,
                  textShadowOffset: {
                    width: -1,
                    height: 1
                  }
                }}>Add New Horse</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
});
