import React, { PureComponent } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { black, brand } from '../../colors'
import { UPDATE_HORSE } from '../../screens'

const { width } = Dimensions.get('window')
const calcWidth = (width / 2) - 41


export default class HorseBarnCard extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.newHorse = this.newHorse.bind(this)
  }

  newHorse () {
    this.props.navigator.push({
      screen: UPDATE_HORSE,
      title: 'New Horse',
      animationType: 'slide-up',
      passProps: {
        newHorse: true
      }
    })
  }

  render() {
    let source = require('../../img/emptyHorseBlack.png')
    let horse = this.props.horse
    if (horse.get('profilePhotoID')) {
      source = {uri: horse.getIn(['photosByID', horse.get('profilePhotoID'), 'uri'])}
    }

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
          onPress={() => {
            this.props.horseProfile(horse)
          }}
        >
          <View
            title={horse.name}
            style={{flex: 1}}
          >
            <View style={{flex: 1, alignItems: 'center', paddingBottom: 5}}>
              <Image
                source={source}
                style={{height: calcWidth, width: calcWidth, margin: 10}}
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
                }}>{horse.get('name')}</Text>
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
