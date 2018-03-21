import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker';


import {
  Button,
  Image,
  StyleSheet,
  View
} from 'react-native';


export default class Account extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.signOut = this.signOut.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  signOut () {
    this.props.signOut()
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      this.props.uploadProfilePhoto(image.path)
    });
  }

  render() {
    let uri = 'https://s3.amazonaws.com/equesteo-profile-photos/full_size/empty.png'
    if (this.props.userData.profilePhotoID) {
      uri = `https://s3.amazonaws.com/equesteo-profile-photos/full_size/${this.props.userData.profilePhotoID}.jpeg`
    }
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={{uri: uri}} />
        <Button onPress={this.uploadProfile} title="Upload Profile Photo" />
        <Button onPress={this.signOut} title="Sign Out" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: 100,
    height: 100,
  }
});
