import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  TouchableOpacity,
} from 'react-native'
import URIImage from './URIImage'

export default class MedImage extends PureComponent {
  constructor (props) {
    super(props)
    this.source = this.source.bind(this)
  }

  source () {
    let newSource = this.props.source.uri
    if (newSource && newSource.startsWith('https://')) {
      const splitup = newSource.split('/')
      const filename = splitup[splitup.length - 1]
      const filenameSplitup = filename.split('.')
      splitup[splitup.length - 1] = `${filenameSplitup[0]}_med.${filenameSplitup[1]}`
      newSource = splitup.join('/')
    }
    return newSource
  }

  render () {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <URIImage
          source={{uri: this.source()}}
          style={this.props.style}
          onError={this.props.onError}
          showSource={this.props.showSource}
        >
          {this.props.children}
        </URIImage>
      </TouchableOpacity>
    )
  }
}

MedImage.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string
  }),
  onPress: PropTypes.func,
  style: PropTypes.object,
  showSource: PropTypes.bool,
}

