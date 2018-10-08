import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import PhotoLightbox from '../components/PhotoLightbox'

import { brand } from '../colors'
import { logRender } from '../helpers'

class PhotoLightboxContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
  }

  render() {
    logRender('PhotoLightboxContainer')
    return (
      <PhotoLightbox
        close={this.props.close}
        source={this.props.source}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    close: passedProps.close,
    source: passedProps.source
  }
}

export default  connect(mapStateToProps)(PhotoLightboxContainer)
