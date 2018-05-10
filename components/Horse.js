import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import { Container, Content, Thumbnail } from 'native-base';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class Horse extends Component {
  constructor (props) {
    super(props)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    });
  }

  render() {
    let source = require('../img/empty.png')
    let buttonText = 'Upload Photo'
    if (this.props.horse.profilePhotoID) {
      source = {uri: this.props.horse.photosByID[this.props.horse.profilePhotoID].uri}
      buttonText = 'Change Profile Photo'
    }

    const byTimestamp = {}
    for (let photoID of Object.keys(this.props.horse.photosByID)) {
      if (photoID !== this.props.horse.profilePhotoID) {
        const photoData = this.props.horse.photosByID[photoID]
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
      <View style={{flex: 1, padding: 20}}>
        <Image style={styles.image} source={source} />
        <View style={styles.profileButton}>
          <Button onPress={this.uploadPhoto} title={buttonText} />
        </View>
          <Container>
            <Content>
              <Text>Other Photos</Text>
              <Container style={styles.photoContainer}>
                {sortedVals}
              </Container>
            </Content>
          </Container>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 130,
    height: 130,
  },
  profileButton: {
    width: 130,
    paddingTop: 2,
  },
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
});
