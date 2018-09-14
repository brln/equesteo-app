import React, { PureComponent } from 'react';
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native'
import { Navigation } from 'react-native-navigation'


import { PHOTO_LIGHTBOX } from '../screens'

export default class SwipablePhoto extends PureComponent {

  constructor (props) {
    super(props)
    this.closeLightbox = this.closeLightbox.bind(this)
    this.showLightbox = this.showLightbox.bind(this)
  }

  closeLightbox () {
    Navigation.pop(this.props.componentId)
  }

  showLightbox () {
    Navigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        id: PHOTO_LIGHTBOX,
        passProps: {
          source: this.props.source,
          close: this.closeLightbox
        }
      }
    })
  }

  render () {
    return (
      <TouchableWithoutFeedback style={styles.slide} onPress={this.showLightbox}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={this.props.source}
        />
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
});
