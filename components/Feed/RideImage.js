import React, { PureComponent } from 'react'
import {
  Image,
} from 'react-native';

import { logError } from '../../helpers'
import { STATIC_MAPS_API_KEY } from 'react-native-dotenv'

export default class RideImage extends PureComponent {
  render() {
    const uriWithKey = this.props.uri + `&${STATIC_MAPS_API_KEY}`
    return (
      <Image
        source={{uri: uriWithKey}}
        style={this.props.style}
        onError={(e) => {
          logError('there was an error loading RideImage image')
          logError(uriWithKey)
        }}
      />
    )
  }
}
