import React, { PureComponent } from 'react';
import {
  Dimensions,
  View,
} from 'react-native';

import { black, brand } from '../../colors'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class HorseBarnCard extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <View
        elevation={5}
        style={{
          borderRadius: 4,
          marginBottom: 20,
          backgroundColor: this.props.horse.get('color') || brand,
          shadowColor: black,
          shadowOffset: {
            width: 0,
            height: 3
          },
          shadowRadius: 5,
          shadowOpacity: 1.0
        }}
      >
        <Thumbnail
          onPress={() => { this.props.horseProfile(this.props.horse, this.props.ownerID) }}
          source={{uri: this.props.horsePhotos.getIn([this.props.horse.get('profilePhotoID'), 'uri'])}}
          emptySource={require('../../img/emptyHorseBlack.png')}
          empty={!this.props.horse.get('profilePhotoID')}
          height={(width / 2) - (width / 12)}
          width={(width / 2) - (width / 12)}
          textOverlay={this.props.horse.get('name')}
          padding={5}
        />
      </View>
    )
  }
}
