import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import { black, brand } from '../../colors'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class NewHorseButton extends PureComponent {
  render() {
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
        <Thumbnail
          emptySource={require('../../img/emptyHorseBlack.png')}
          empty={true}
          height={(width / 2) - (width / 12)}
          width={(width / 2) - (width / 12)}
          textOverlay={'Add New Horse'}
          padding={5}
          onPress={this.props.newHorse}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
});
