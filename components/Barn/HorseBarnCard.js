import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import URIImage from '../URIImage'
import BuildImage from '../BuildImage'
import { black, brand } from '../../colors'
import { logError } from '../../helpers'

const { width } = Dimensions.get('window')
const calcWidth = (width / 2) - 41


export default class HorseBarnCard extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    let horseImageStyle = {height: calcWidth, width: calcWidth, margin: 10}
    let horseImage = (
      <BuildImage
        source={require('../../img/emptyHorseBlack.png')}
        style={horseImageStyle}
      />
    )

    let horse = this.props.horse
    if (horse.get('profilePhotoID')) {
      horseImage = (
        <URIImage
          source={{uri: this.props.horsePhotos.getIn([horse.get('profilePhotoID'), 'uri'])}}
          style={horseImageStyle}
          onError={e => logError("Can't load HorseBarnCard image")}
          showSource={false}
        />
      )
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
            this.props.horseProfile(horse, this.props.ownerID)
          }}
        >
          <View
            title={horse.name}
            style={{flex: 1}}
          >
            <View style={{flex: 1, alignItems: 'center', paddingBottom: 5}}>
              { horseImage }
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
