import React, { Component } from 'react'
import {
  Card,
  CardItem,
} from 'native-base'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { darkBrand } from "../colors"
import PhotosByTimestamp from './PhotosByTimestamp'

export default class UpdateProfile extends Component {
  constructor (props) {
    super(props)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeAboutMe = this.changeAboutMe.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
  }

  changeFirstName (newText) {
    this.props.changeAccountDetails({
      ...this.props.user,
      firstName: newText
    })
  }

  changeLastName (newText) {
    this.props.changeAccountDetails({
      ...this.props.user,
      lastName: newText
    })
  }

  changeProfilePhotoID (profilePhotoID) {
    this.props.changeAccountDetails({
      ...this.props.user,
      profilePhotoID
    })
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails({
      ...this.props.user,
      aboutMe: newText
    })
  }

  render() {
    return (
      <ScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.container}>
          <View style={{flex: 1, padding: 5}}>

            <Card>
              <CardItem header>
                <Text>First Name:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                <TextInput
                  style={{width: '100%'}}
                  underlineColorAndroid={darkBrand}
                  onChangeText={this.changeFirstName}
                  value={this.props.user.firstName}
                />
              </CardItem>

              <CardItem header>
                <Text>Last Name:</Text>
              </CardItem>

              <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                <TextInput
                  style={{width: '100%'}}
                  underlineColorAndroid={darkBrand}
                  onChangeText={this.changeLastName}
                  value={this.props.user.lastName}
                />
              </CardItem>

              <CardItem header>
                <Text> About Me: </Text>
              </CardItem>

              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <TextInput
                  style={{width: '100%'}}
                  underlineColorAndroid={darkBrand}
                  onChangeText={this.changeAboutMe}
                  value={this.props.user.aboutMe}
                />
              </CardItem>
            </Card>

            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Profile Picture:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <PhotosByTimestamp
                  changeProfilePhoto={this.changeProfilePhotoID}
                  photosByID={this.props.user.photosByID}
                  profilePhotoID={this.props.user.profilePhotoID}
                />
              </CardItem>
            </Card>

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
});
