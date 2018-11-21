import React, { PureComponent } from 'react'
import {
  Image
} from 'react-native'

export default class BuildImage extends PureComponent {
  render () {
    return (
      <Image
        resizeMode={this.props.resizeMode}
        source={this.props.source}
        style={this.props.style}
        onError={this.props.onError}
      />
    )
  }
}
