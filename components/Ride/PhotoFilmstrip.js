import React, { Component } from 'react'
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Thumbnail } from 'native-base'
import { brand } from '../../colors'
import { PHOTO_LIGHTBOX } from '../../screens'

const { width } = Dimensions.get('window')

export default class PhotoFilmstrip extends Component {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
    this.showLightbox = this.showLightbox.bind(this)
  }

  showLightbox (source) {
    return () => {
      if (this.props.navigator) {
        this.props.navigator.push({
          screen: PHOTO_LIGHTBOX,
          passProps: {
            source,
            close: this.closeLightbox
          },
        })
      }
    }

  }

  thumbnail (photoID, style, source) {
    return (
      <TouchableOpacity
        key={photoID}
        style={styles.photoThumbnail}
        onPress={this.showLightbox(source)}
      >
        <Thumbnail
          style={style}
          square
          source={source}

        />
      </TouchableOpacity>
    )
  }

  render () {
    const byTimestamp = {}
    for (let photoID of this.props.photosByID.keySeq()) {
      const photoData = this.props.photosByID.get(photoID)
      const source = {uri: photoData.get('uri')}
      let style = styles.thumbnail
      byTimestamp[photoData.get('timestamp')] = this.thumbnail(photoID, style, source)
    }
    const sortedKeys = Object.keys(byTimestamp).sort((a, b) => b - a)
    const sortedVals = []
    for (let key of sortedKeys) {
      sortedVals.push(byTimestamp[key])
    }
    return (
      <View style={styles.photoContainer}>
        {sortedVals}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoThumbnail: {
    padding: 5
  },
  thumbnail: {
    width: width / 4,
    height: width / 4,
  },
})
