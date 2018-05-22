import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import { Container, Content } from 'native-base';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PhotosByTimestamp from './PhotosByTimestamp'

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
    }).catch(() => {});
  }

  render() {
    let source = require('../img/empty.png')
    let buttonText = 'Upload Photo'
    if (this.props.horse.profilePhotoID) {
      source = {uri: this.props.horse.photosByID[this.props.horse.profilePhotoID].uri}
      buttonText = 'Change Profile Photo'
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
            <PhotosByTimestamp
              photosByID={this.props.horse.photosByID}
              profilePhotoID={this.props.horse.profilePhotoID}
            />
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
});
