import React, { Component } from 'react'
import {
  StyleSheet,
  View
} from 'react-native';
import { Container, Thumbnail } from 'native-base';

export default PhotosByTimestamp = (props) => {
    const byTimestamp = {}
    for (let photoID of Object.keys(props.photosByID)) {
      if (photoID !== props.profilePhotoID) {
        const photoData = props.photosByID[photoID]
        const source = {uri: photoData.uri}
        byTimestamp[photoData.timestamp] = (
          <View key={photoID} style={styles.photoThumbnail}>
            <Thumbnail
              style={styles.thumbnail}
              square
              source={source}
            />
          </View>
        )
      }
    }
    const sortedKeys = Object.keys(byTimestamp).sort((a, b) => b - a)
    const sortedVals = []
    for (let key of sortedKeys) {
      sortedVals.push(byTimestamp[key])
    }
    return (
      <Container style={styles.photoContainer}>
        {sortedVals}
      </Container>
    )
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
    width: 80,
    height: 80,
  }
})
