import React, { PureComponent } from 'react';
import {
  CheckBox,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  Card,
  CardItem,
  Fab,
} from 'native-base'
import ImagePicker from 'react-native-image-crop-picker'

import { brand, darkBrand } from '../../colors'
import FabImage from '../FabImage'
import HorseSelector from './HorseSelector'
import PhotosByTimestamp from '../PhotosByTimestamp'
import PhotoMenu from '../UpdateHorse/PhotoMenu'

export default class RideDetails extends PureComponent {
  constructor (props) {
    super(props)
    this.uploadPhoto = this.uploadPhoto.bind(this)
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.state = {
      showPhotoMenu: false,
      selectedPhotoID: null
    }
  }

  deletePhoto () {
    this.props.deletePhoto(this.state.selectedPhotoID)
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  openPhotoMenu (coverPhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: coverPhotoID
    })
  }

  clearPhotoMenu () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  changeCoverPhoto () {
    this.props.changeCoverPhoto(this.state.selectedPhotoID)
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  changeRideName (name) {
    this.props.changeRideName(name)
  }

  uploadPhoto() {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch((e) => {})
  }

  render() {
    let photoMenu = null
    if (this.state.showPhotoMenu) {
      photoMenu = (
        <PhotoMenu
          changeProfilePhotoID={this.changeCoverPhoto}
          deletePhoto={this.deletePhoto}
          clearPhotoMenu={this.clearPhotoMenu}
          selectedPhotoID={this.state.selectedPhotoID}
        />
      )
    }
    return (
      <View>
        <ScrollView>
          <View style={styles.container}>
            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Ride Photos</Text>
                </View>
              </CardItem>

              <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
                <PhotosByTimestamp
                  photosByID={this.props.photosByID}
                  profilePhotoID={this.props.coverPhotoID}
                  changeProfilePhoto={this.openPhotoMenu}
                />
              </CardItem>

              <View style={{paddingTop: 15}}>
                <Fab
                  direction="up"
                  style={{ backgroundColor: brand }}
                  position="bottomRight"
                  onPress={this.uploadPhoto}>
                  <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
                </Fab>
              </View>
            </Card>

            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Ride Name</Text>
                </View>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
                <TextInput
                  style={{width: '100%'}}
                  value={this.props.rideName}
                  onChangeText={this.changeRideName}
                  selectTextOnFocus={true}
                  underlineColorAndroid={darkBrand}
                />
              </CardItem>
            </Card>

            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Horse</Text>
                </View>
              </CardItem>
              <View style={{marginLeft: 20, marginBottom: 30}}>
                <HorseSelector
                  changeHorseID={this.props.changeHorseID}
                  horseID={this.props.horseID}
                  horses={this.props.horses}
                />
              </View>
            </Card>

            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Privacy</Text>
                </View>
              </CardItem>

              <View style={{marginLeft: 20, marginBottom: 30}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <CheckBox
                    value={this.props.isPublic}
                    onValueChange={this.props.changePublic}
                  />
                  <View style={{justifyContent: 'center'}}>
                    <Text>Show this ride on other people's feed.</Text>
                  </View>
                </View>
              </View>
            </Card>
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
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  saveButton: {
    padding: 100
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonPad: {
    margin: 20
  },
});
