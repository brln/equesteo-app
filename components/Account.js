import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker';

import {
  Button,
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
      console.log(image);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Button onPress={this.signOut} title="Sign Out" />
        <Button onPress={this.uploadProfile} title="Upload Profile Photo" />
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
});
