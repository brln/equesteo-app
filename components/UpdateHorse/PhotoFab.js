import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import {
  Fab,
} from 'native-base';

import { brand } from '../../colors'
import FabImage from '../FabImage'


export default class UpdateHorse extends PureComponent {
  render() {
    return (
      <View style={{paddingTop: 30}}>
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.props.pickPhoto}>
          <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
        </Fab>
      </View>
    )
  }
}

