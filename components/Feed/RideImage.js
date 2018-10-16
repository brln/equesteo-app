import React, { PureComponent } from 'react'

import { logError } from '../../helpers'
import { STATIC_MAPS_API_KEY } from 'react-native-dotenv'
import URIImage from '../URIImage'

export default class RideImage extends PureComponent {
  render() {
    const uriWithKey = this.props.uri + `&key=${STATIC_MAPS_API_KEY}`
    return (
      <URIImage
        wrapFlex={1}
        source={{uri: uriWithKey}}
        style={this.props.style}
        onError={(e) => {
          logError('there was an error loading RideImage image')
          logError(uriWithKey)
        }}
        showSource={true}
      />
    )
  }
}
