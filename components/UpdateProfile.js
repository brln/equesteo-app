import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
  CheckBox,
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
import PhotoMenu from './UpdateHorse/PhotoMenu'

export default class UpdateProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.inputs = {}
    this.state = {
      showPhotoMenu: false,
      selectedPhotoID: null
    }
    this.changeDefaultPublic = this.changeDefaultPublic.bind(this)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeAboutMe = this.changeAboutMe.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.moveToLastName = this.moveToLastName.bind(this)
    this.moveToAboutMe = this.moveToAboutMe.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
  }

  openPhotoMenu (profilePhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: profilePhotoID
    })
  }

  deletePhoto () {
    const newPhotos = this.props.user.get('photosByID').delete(this.state.selectedPhotoID)
    let newDeets = Map({
      photosByID: newPhotos
    })
    if (this.state.selectedPhotoID === this.props.user.get('profilePhotoID')) {
      newDeets = newDeets.set('profilePhotoID', null)
    }
    this.props.changeAccountDetails(this.props.user.merge(newDeets))
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  clearPhotoMenu () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  changeDefaultPublic () {
    this.props.changeAccountDetails(this.props.user.set('ridesDefaultPublic', !this.props.user.get('ridesDefaultPublic')))
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
    this.props.changeAccountDetails(this.props.user.set('profilePhotoID', this.state.selectedPhotoID))
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails(this.props.user.set('aboutMe', newText))
  }

  render() {
    const hasPictures = this.props.user.get('photosByID').count() > 0
    let photoMenu = null
    if (this.state.showPhotoMenu) {
      photoMenu = (
        <PhotoMenu
          changeProfilePhotoID={this.changeProfilePhotoID}
          deletePhoto={this.deletePhoto}
          clearPhotoMenu={this.clearPhotoMenu}
          selectedPhotoID={this.state.selectedPhotoID}
        />
      )
    }
    return (
      <View>
        <ScrollView keyboardShouldPersistTaps={'always'}>
          <View style={styles.container}>
            <View style={{flex: 1, padding: 5}}>
              { hasPictures ? <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Profile Picture:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <PhotosByTimestamp
                    changeProfilePhoto={this.openPhotoMenu}
                    photosByID={this.props.user.get('photosByID')}
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
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.changeAboutMe}
                    value={this.props.user.get('aboutMe')}
                    ref={(i) => this.inputs['aboutMe'] = i}
                    maxLength={2000}
                  />
                </CardItem>
              </Card>

               <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Privacy:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <CheckBox
                        checked={this.props.user.get('ridesDefaultPublic')}
                        onPress={this.changeDefaultPublic}
                      />
                    </View>
                    <View style={{flex: 6, justifyContent: 'center'}}>
                      <Text>Default my rides to publicly viewable.</Text>
                    </View>
                  </View>
                </CardItem>
              </Card>
            </View>
          </View>
        </ScrollView>
        { photoMenu }
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
