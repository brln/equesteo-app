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
          color: 'black',
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
        sources={this.props.sources}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    close: passedProps.close,
    sources: passedProps.sources
  }
}

export default  connect(mapStateToProps)(PhotoLightboxContainer)
