import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
} from 'native-base'
import {
  CheckBox,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { darkBrand } from "../colors"
import PhotosByTimestamp from './PhotosByTimestamp'

export default class UpdateProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.inputs = {}
    this.changeDefaultPublic = this.changeDefaultPublic.bind(this)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeAboutMe = this.changeAboutMe.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
    this.moveToLastName = this.moveToLastName.bind(this)
    this.moveToAboutMe = this.moveToAboutMe.bind(this)
  }

  changeDefaultPublic (value) {
    this.props.changeAccountDetails(this.props.user.set('ridesDefaultPublic', value))
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

  changeProfilePhotoID (profilePhotoID) {
    this.props.changeAccountDetails(this.props.user.set('profilePhotoID', profilePhotoID))
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails(this.props.user.set('aboutMe', newText))
  }

  render() {
    const hasPictures = this.props.user.get('photosByID').count() > 0
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
                  value={this.props.user.get('firstName')}
                  ref={(i) => this.inputs['firstName'] = i}
                  onSubmitEditing={this.moveToLastName}
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
                  value={this.props.user.get('lastName')}
                  ref={(i) => this.inputs['lastName'] = i}
                  onSubmitEditing={this.moveToAboutMe}
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
                  value={this.props.user.get('aboutMe')}
                  ref={(i) => this.inputs['aboutMe'] = i}
                />
              </CardItem>
            </Card>

            { hasPictures ? <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Profile Picture:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <PhotosByTimestamp
                  changeProfilePhoto={this.changeProfilePhotoID}
                  photosByID={this.props.user.get('photosByID')}
                  profilePhotoID={this.props.user.get('profilePhotoID')}
                />
              </CardItem>
            </Card> : null }

             <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Privacy:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <CheckBox
                    value={this.props.user.get('ridesDefaultPublic')}
                    onValueChange={this.changeDefaultPublic}
                  />
                  <View style={{justifyContent: 'center'}}>
                    <Text>Default my rides to publicly viewable.</Text>
                  </View>
                </View>
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
