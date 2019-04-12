import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import PhotoLightbox from '../components/PhotoLightbox'

import { logRender } from '../helpers'
import { EqNavigation } from '../services'

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
    Navigation.events().bindComponent(this);
  }

  componentWillUnmount () {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    logRender('PhotoLightboxContainer')
    return (
      <PhotoLightbox
        sources={this.props.sources}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    onClose: passedProps.onClose,
    sources: passedProps.sources
  }
}

export default  connect(mapStateToProps)(PhotoLightboxContainer)
