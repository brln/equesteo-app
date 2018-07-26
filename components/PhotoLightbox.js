import React, { PureComponent } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import {
  StyleSheet,
  View
} from 'react-native';

export default class PhotoLightbox extends PureComponent {
  constructor (props) {
    super(props)
    this.close = this.close.bind(this)
  }

  close () {
    this.props.close()
  }

  render() {
    return (
      <ImageViewer renderIndicator={() => {}} imageUrls={[{url: this.props.source.uri}]}/>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
