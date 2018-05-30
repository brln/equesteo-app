import React, { Component } from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { profilePhotoURL } from "../helpers"

export default class Account extends Component {
  constructor (props) {
    super(props)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeAboutMe = this.changeAboutMe.bind(this)
    this.signOut = this.signOut.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  changeFirstName (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      firstName: newText
    })
  }

  changeLastName (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      lastName: newText
    })
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      aboutMe: newText
    })
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
    let source = require('../img/empty.png')
    let buttonText = 'Upload Profile Photo'
    if (this.props.userData.profilePhotoID) {
      source = {uri: this.props.userData.photosByID[this.props.userData.profilePhotoID].uri}
      buttonText = 'Change Profile Photo'
    }
    return (
      <ScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <View style={{flex: 1, padding: 20}}>
              <Image style={styles.image} source={source} />
              <View style={styles.profileButton}>
                <Button onPress={this.uploadProfile} title={buttonText} />
              </View>
            </View>
            <View style={{flex: 1, padding: 5, left: -15}}>
              <Text>First Name:</Text>
              <TextInput
                onChangeText={this.changeFirstName}
                value={this.props.userData.firstName}
              />

              <Text>Last Name:</Text>
              <TextInput
                onChangeText={this.changeLastName}
                value={this.props.userData.lastName}
              />

            </View>
          </View>
          <View style={{flex: 3, padding: 20}}>
            <Text> About Me: </Text>
            <TextInput
              onChangeText={this.changeAboutMe}
              value={this.props.userData.aboutMe}
            />
          </View>
          <View style={{ paddingLeft: 30, paddingRight: 30, paddingBottom: 10 }}>
            <Button style={{ color: 'red' }} onPress={this.signOut} title="Sign Out" />
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  topSection: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  image: {
    width: 130,
    height: 130,
  },
  profileButton: {
    width: 130,
    paddingTop: 2,
  }
});
