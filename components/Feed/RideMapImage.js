import React, { PureComponent } from 'react'

import config from '../../dotEnv'
import URIImage from '../Images/URIImage'

export default class RideMapImage extends PureComponent {
  render () {
    const encodedURL = new Buffer(this.props.uri).toString("base64")
    const uriWithKey = `${config.API_URL}/rideMap/${encodedURL}`
    return (
      <URIImage
        wrapFlex={1}
        source={{uri: uriWithKey}}
        style={this.props.style}
        onError={(e) => {
          this.props.logInfo('there was an error loading RideImage image')
        }}
        showSource={true}
      />
    )
  }
}
