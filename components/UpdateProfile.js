import React, { PureComponent } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
  Card,
  CardItem,
  CheckBox,
} from 'native-base'
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { darkBrand } from "../colors"
import PhotosByTimestamp from './PhotosByTimestamp'
import PhotoMenu from './PhotoMenu'

export default class UpdateProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.inputs = {}
    this.changeAboutMe = this.changeAboutMe.bind(this)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.moveToLastName = this.moveToLastName.bind(this)
    this.moveToAboutMe = this.moveToAboutMe.bind(this)
  }

  deletePhoto () {
    this.props.markPhotoDeleted(this.props.selectedPhotoID)
    this.props.clearPhotoMenu()
  }

  moveToLastName () {
    this.inputs['lastName'].focus()
  }

  moveToAboutMe () {
    this.inputs['aboutMe'].focus()
  }

  changeFirstName (newText) {
    this.props.changeAccountDetails(this.props.user.set('firstName', newText))
  }

  changeLastName (newText) {
    this.props.changeAccountDetails(this.props.user.set('lastName', newText))
  }

  changeProfilePhotoID () {
    this.props.changeAccountDetails(
      this.props.user.set('profilePhotoID', this.props.selectedPhotoID)
    )
    this.props.clearPhotoMenu()
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails(this.props.user.set('aboutMe', newText))
  }

  render() {
    const hasPictures = this.props.userPhotos.count() > 0
    return (
      <View>
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
          <View style={styles.container}>
            <View style={{flex: 1, padding: 5}}>
              { hasPictures ? <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Profile Picture:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <PhotosByTimestamp
                    changeProfilePhoto={this.props.openPhotoMenu}
                    photosByID={this.props.userPhotos}
                    profilePhotoID={this.props.user.get('profilePhotoID')}
                  />
                </CardItem>
              </Card> : null }

              <Card>
                <CardItem header>
                  <Text>First Name:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.changeFirstName}
                    value={this.props.user.get('firstName')}
                    ref={(i) => this.inputs['firstName'] = i}
                    onSubmitEditing={this.moveToLastName}
                    maxLength={200}
                  />
                </CardItem>

                <CardItem header>
                  <Text>Last Name:</Text>
                </CardItem>

                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.changeLastName}
                    value={this.props.user.get('lastName')}
                    ref={(i) => this.inputs['lastName'] = i}
                    onSubmitEditing={this.moveToAboutMe}
                    maxLength={200}
                  />
                </CardItem>

                <CardItem header>
                  <Text> About Me: </Text>
                </CardItem>

                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <TextInput
                    multiline={true}
                    style={{width: '100%', height: 150, padding: 10, borderColor: darkBrand, borderWidth: 1, textAlignVertical: "top" }}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.changeAboutMe}
                    value={this.props.user.get('aboutMe')}
                    ref={(i) => this.inputs['aboutMe'] = i}
                    maxLength={2000}
                  />
                </CardItem>
              </Card>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <PhotoMenu
          changeProfilePhotoID={this.changeProfilePhotoID}
          deletePhoto={this.deletePhoto}
          clearPhotoMenu={this.props.clearPhotoMenu}
          selectedPhotoID={this.props.selectedPhotoID}
          visible={this.props.showPhotoMenu}
        />
      </View>
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
});
