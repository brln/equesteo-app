import React, { PureComponent } from 'react'
import {
  Image,
} from 'react-native';

import { STATIC_MAPS_API_KEY } from 'react-native-dotenv'

export default class RideImage extends PureComponent {
  render() {
    const uriWithKey = this.props.uri + `&${STATIC_MAPS_API_KEY}`
    return (
      <Image
        source={{uri: uriWithKey}}
        style={{height: 200, width: null, flex: 1}}
      />
    )
  }
}
