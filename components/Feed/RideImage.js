import React, { PureComponent } from 'react'

import { logError } from '../../helpers'
import { MAPBOX_TOKEN } from 'react-native-dotenv'
import URIImage from '../Images/URIImage'

export default class RideImage extends PureComponent {
  render() {
    const uriWithKey = this.props.uri + `?access_token=${MAPBOX_TOKEN}`
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
