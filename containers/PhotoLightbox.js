import React, { Component } from 'react'
import { connect } from 'react-redux';
import { logRender } from '../helpers'

import PhotoLightbox from '../components/PhotoLightbox'
import NavigatorComponent from './NavigatorComponent'

class PhotoLightboxContainer extends NavigatorComponent {
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
