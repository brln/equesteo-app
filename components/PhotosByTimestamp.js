import React, { Component } from 'react'
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native';

import { darkGrey, orange } from '../colors'
import Thumbnail from './Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class PhotosByTimestamp extends Component {
  constructor (props) {
    super(props)
    this.changeProfilePhoto = this.changeProfilePhoto.bind(this)
  }

  changeProfilePhoto (photoID) {
    return () => {
      this.props.changeProfilePhoto(photoID)
    }
  }

  render () {
    const byTimestamp = {}
    for (let photoID of this.props.photosByID.keySeq()) {
      const photoData = this.props.photosByID.get(photoID)
      byTimestamp[photoData.get('timestamp')] = (
        <Thumbnail
          borderColor={photoID === this.props.profilePhotoID ? orange : darkGrey}
          key={photoData.get('uri')}
          source={{uri: photoData.get('uri')}}
          onPress={this.changeProfilePhoto(photoID)}
          width={width / 4}
          height={width / 4}
          padding={2}
        />
      )
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
})
