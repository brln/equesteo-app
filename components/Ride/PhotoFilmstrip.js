import React, { Component } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Thumbnail } from 'native-base'

const { width } = Dimensions.get('window')

export default class PhotoFilmstrip extends Component {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
  }

  showPhotoLightbox (source) {
    return () => {
      this.props.showPhotoLightbox(source)
    }
  }

  thumbnail (photoID, style, source) {
    return (
      <TouchableOpacity
        key={photoID}
        style={styles.photoThumbnail}
        onPress={this.showPhotoLightbox(source)}
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
    let renderAnything = false
    for (let photoID of this.props.photosByID.keySeq()) {
      if (this.props.exclude.indexOf(photoID) < 0) {
        const photoData = this.props.photosByID.get(photoID)
        const source = {uri: photoData.get('uri')}
        let style = styles.thumbnail
        byTimestamp[photoData.get('timestamp')] = this.thumbnail(photoID, style, source)
        renderAnything = true
      }
    }
    const sortedKeys = Object.keys(byTimestamp).sort((a, b) => b - a)
    const sortedVals = []
    for (let key of sortedKeys) {
      sortedVals.push(byTimestamp[key])
    }
    let toRender = null
    if (renderAnything) {
      toRender = (
        <ScrollView horizontal={true} style={styles.photoContainer}>
          {sortedVals}
        </ScrollView>
      )
    }
    return toRender
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
