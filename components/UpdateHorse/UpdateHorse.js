import { Map } from 'immutable'
import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import RNPickerSelect from 'react-native-picker-select';

import { brand, darkBrand } from '../../colors'
import FabImage from '../FabImage'
import PhotosByTimestamp from '../PhotosByTimestamp'
import PhotoMenu from './PhotoMenu'


export default class UpdateHorse extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showPhotoMenu: false,
      selectedPhotoID: null
    }
    this.changeHorseBirthDay = this.changeHorseBirthDay.bind(this)
    this.changeHorseBirthMonth = this.changeHorseBirthMonth.bind(this)
    this.changeHorseBirthYear = this.changeHorseBirthYear.bind(this)
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.changeHorseDescription = this.changeHorseDescription.bind(this)
    this.changeHorseHeightInches = this.changeHorseHeightInches.bind(this)
    this.changeHorseHeightHands = this.changeHorseHeightHands.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.changeHorseSex = this.changeHorseSex.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.pickPhoto = this.pickPhoto.bind(this)
    this.renderHandsPicker = this.renderHandsPicker.bind(this)
  }

  pickPhoto () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {})
  }

  openPhotoMenu (profilePhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: profilePhotoID
    })
  }

  changeProfilePhotoID () {
    this.props.changeHorseDetails({
      profilePhotoID: this.state.selectedPhotoID
    })
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
  }

  deletePhoto () {
    const newPhotos = this.props.horse.get('photosByID').delete(this.state.selectedPhotoID)
    let newDeets = Map({
      photosByID: newPhotos
    })
    if (this.state.selectedPhotoID === this.props.horse.get('profilePhotoID')) {
      newDeets = newDeets.set('profilePhotoID', null)
    }
    this.props.changeHorseDetails(newDeets)
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

  changeHorseBirthDay (birthDay) {
    this.props.changeHorseDetails({ birthDay })
  }

  changeHorseSex (sex) {
    this.props.changeHorseDetails({ sex })
  }

  changeHorseBirthMonth (birthMonth) {
    this.props.changeHorseDetails({ birthMonth })
  }

  changeHorseBirthYear (birthYear) {
    this.props.changeHorseDetails({ birthYear })
  }

  changeHorseDescription (newDesc) {
    this.props.changeHorseDetails({
      description: newDesc
    })
  }

  changeHorseName (newName) {
    this.props.changeHorseDetails({
      name: newName
    })
  }

  changeHorseBreed (breed) {
    this.props.changeHorseDetails({ breed })
  }

  changeHorseHeightHands (newHands) {
    this.props.changeHorseDetails({
      heightHands: newHands
    })
  }

  changeHorseHeightInches (newInches) {
    this.props.changeHorseDetails({
      heightInches: newInches
    })
  }

  monthPicker (onValueChange) {
    const items = [
      { label: "Jan", value: "1" },
      { label: "Feb", value: "2" },
      { label: "Mar", value: "3" },
      { label: "Apr", value: "4" },
      { label: "May", value: "5" },
      { label: "Jun", value: "6" },
      { label: "Jul", value: "7" },
      { label: "Aug", value: "8" },
      { label: "Sep", value: "9" },
      { label: "Oct", value: "10" },
      { label: "Nov", value: "11" },
      { label: "Dec", value: "12" },
    ]
    return (
      <View style={{flex: 3, height: 50, borderColor: darkBrand, borderWidth: 1, marginRight: 10}}>
        <RNPickerSelect
          value={this.props.horse.get('birthMonth')}
          items={items}
          onValueChange={onValueChange}
          style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
          placeholder={{
            label: 'Month',
            value: null,
          }}
        />
      </View>
    )
  }

  dayPicker (onValueChange) {
    const allDays = []
    for (let i = 1; i <= 31; i++) {
      allDays.push({ label: i.toString(), value: i.toString() })
    }
    return (
      <View style={{flex: 2, height: 50, borderColor: darkBrand, borderWidth: 1, marginRight: 10}}>
        <RNPickerSelect
          value={this.props.horse.get('birthDay')}
          items={allDays}
          style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
          onValueChange={onValueChange}
          placeholder={{
            label: 'Day',
            value: null,
          }}
        />
      </View>
    )
  }

  yearPicker (onValueChange) {
    const startYear = 1980
    const allYears = []
    for (let i = startYear; i <= 2018; i++) {
      allYears.push({label: i.toString(), value: i.toString()})
    }
    return (
      <View style={{flex: 3, height: 50, borderColor: darkBrand, borderWidth: 1}}>
        <RNPickerSelect
          items={allYears}
          value={this.props.horse.get('birthYear')}
          style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
          onValueChange={onValueChange}
          placeholder={{
            label: 'Year',
            value: null,
          }}
        />
      </View>
    )
  }

  sexPicker (onValueChange) {
    const items = [
      {label: "Mare", value: "Mare"},
      {label: "Stallion", value: "Stallion"},
      {label: "Gelding", value: "Gelding"},
      {label: "Other", value: "Other"},
    ]
    return (
      <View style={{flex: 1, height: 50, borderColor: darkBrand, borderWidth: 1}}>
        <RNPickerSelect
          value={this.props.horse.get('sex')}
          onValueChange={onValueChange}
          items={items}
          style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
          placeholder={{
            label: 'None',
            value: null,
          }}
        />
      </View>
    )
  }

  renderHandsPicker () {
    const handsItems = [
      { label: "11", value: "11" },
      { label: "12", value: "12" },
      { label: "13", value: "13" },
      { label: "14", value: "14" },
      { label: "15", value: "15" },
      { label: "16", value: "16" },
      { label: "17", value: "17" },
    ]
    const inchesItems = [
      { label: "0", value: "0" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
    ]
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{flex: 3, height: 50, borderColor: darkBrand, borderWidth: 1, marginRight: 10}}>
          <RNPickerSelect
            value={this.props.horse.get('heightHands')}
            onValueChange={this.changeHorseHeightHands}
            items={handsItems}
            style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
            placeholder={{
              label: 'Hands',
              value: null,
            }}
          />
        </View>
        <View style={{flex: 2, height: 50, borderColor: darkBrand, borderWidth: 1}}>
          <RNPickerSelect
            value={this.props.horse.get('heightInches')}
            style={{inputIOS: {fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 10}}}
            onValueChange={this.changeHorseHeightInches}
            items={inchesItems}
            placeholder={{
              label: 'Inches',
              value: null,
            }}
          >
          </RNPickerSelect>
        </View>
      </View>
    )
  }

  render() {
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
              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Profile Picture:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <PhotosByTimestamp
                    changeProfilePhoto={this.openPhotoMenu}
                    photosByID={this.props.horse.get('photosByID')}
                    profilePhotoID={this.props.horse.get('profilePhotoID')}
                  />
                </CardItem>

                <View style={{paddingTop: 15}}>
                  <Fab
                    direction="up"
                    style={{ backgroundColor: brand }}
                    position="bottomRight"
                    onPress={this.pickPhoto}>
                    <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
                  </Fab>
                </View>
              </Card>


              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Name:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    value={this.props.horse.get('name')}
                    onChangeText={this.changeHorseName}
                    underlineColorAndroid={'transparent'}
                  />
                </CardItem>

                <CardItem header>
                  <Text style={{color: darkBrand }}>Description:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    value={this.props.horse.get('description')}
                    onChangeText={this.changeHorseDescription}
                    multiline={true}
                    numberOfLines={3}
                    underlineColorAndroid="transparent"
                  />
                </CardItem>
              </Card>

              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Height:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  {this.renderHandsPicker()}
                </CardItem>

                <CardItem header>
                  <Text style={{color: darkBrand }}>Birthday:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    {this.monthPicker(this.changeHorseBirthMonth)}
                    {this.dayPicker(this.changeHorseBirthDay)}
                    {this.yearPicker(this.changeHorseBirthYear)}
                  </View>
                </CardItem>


                <CardItem header>
                  <Text style={{color: darkBrand }}>Breed:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                    value={this.props.horse.get('breed')}
                    onChangeText={this.changeHorseBreed}
                    underlineColorAndroid={'transparent'}
                  />
                </CardItem>


                <CardItem header>
                  <Text style={{color: darkBrand }}>Sex:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    {this.sexPicker(this.changeHorseSex)}
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
