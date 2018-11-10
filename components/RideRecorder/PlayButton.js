import React, { PureComponent } from 'react';
import {
  Dimensions,
  Image,
  TouchableOpacity,
  View
} from 'react-native';

import { green } from '../../colors'

const { width, height } = Dimensions.get('window')


export default class PlayButton extends PureComponent {
  render() {
    const buttonHeight = width / 3
    const buttonWidth = width / 3
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          position: 'absolute',
          top: (height * 2/5) - (buttonHeight / 2) - 56,
          left: (width / 2) - (buttonWidth / 2),
          borderWidth: 3,
          borderColor: green,
          justifyContent: 'center',
          height: buttonHeight,
          width: buttonWidth,
          backgroundColor: green,
          borderRadius: buttonWidth / 2,
          padding: 30,
          elevation: 20,
        }}
        onPress={this.props.onPress}
      >
        <Image
          source={require('../../img/playButton.png')}
          style={{height: '100%', width: '100%'}}
        />
      </TouchableOpacity>

    )
  }
}

