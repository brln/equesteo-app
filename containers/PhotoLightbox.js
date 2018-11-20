import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import PhotoLightbox from '../components/PhotoLightbox'

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
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'back') {
      Navigation.pop(this.props.componentId)
      if (this.props.onClose) {
        this.props.onClose()
      }
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
