import React, { Component } from 'react'
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Thumbnail } from 'native-base'

import { orange } from '../colors'

const { width } = Dimensions.get('window')

export default class PhotosByTimestamp extends Component {
  constructor (props) {
    super(props)
    this.changeProfilePhoto = this.changeProfilePhoto.bind(this)
    this.thumbnail = this.thumbnail.bind(this)
  }

  changeProfilePhoto (photoID) {
    return () => {
      this.props.changeProfilePhoto(photoID)
    }
  }

  thumbnail (photoID, style, source) {
    return (
      <TouchableOpacity
        key={photoID}
        style={styles.photoThumbnail}
        onPress={this.changeProfilePhoto(photoID)}
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
    console.log(this.props.photosByID.toJSON())
    const byTimestamp = {}
    for (let photoID of this.props.photosByID.keySeq()) {
      const photoData = this.props.photosByID.get(photoID)
      const source = {uri: photoData.get('uri')}
      let style = styles.thumbnail
      if (photoID === this.props.profilePhotoID) {
        style = styles.profilePhoto
      }
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
  profilePhoto: {
    width: width / 4,
    height: width / 4,
    borderWidth: 5,
    borderColor: orange
  }
})
