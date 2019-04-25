import React, { PureComponent } from 'react'
import {
  Image
} from 'react-native'
import PropTypes from 'prop-types'

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

BuildImage.propTypes = {
  resizeMode: PropTypes.string,
  source: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.null]),
  error: PropTypes.func,
}
