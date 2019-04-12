import React, { PureComponent } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import {
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export default class PhotoLightbox extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <ImageViewer
        renderIndicator={() => {}}
        loadingRender={() => <ActivityIndicator />}
        imageUrls={this.props.sources}
      />
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
