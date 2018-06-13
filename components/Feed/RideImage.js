import React, { PureComponent } from 'react'
import {
  Image,
  StyleSheet,
} from 'react-native';

export default class RideImage extends PureComponent {
  render() {
    return (
      <Image
        source={{uri: this.props.uri}}
        style={{height: 200, width: null, flex: 1}}
      />
    )
  }
}
