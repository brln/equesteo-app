import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base';

import ColorModal from './ColorModal'
import EqPicker from '../EqPicker'
import { brand, darkBrand } from '../../colors'
import PhotoFab from './PhotoFab'
import PhotosByTimestamp from '../PhotosByTimestamp'
import PhotoMenu from '../PhotoMenu'
import GaitSpeedCard from './GaitSpeedCard'
import { logError, DEFAULT_HORSE_SPEEDS } from "../../helpers"

export default class UpdateHorse extends PureComponent {
  constructor (props) {
    super(props)
    this.changeHorseBirthDay = this.changeHorseBirthDay.bind(this)
    this.changeHorseBirthMonth = this.changeHorseBirthMonth.bind(this)
    this.changeHorseBirthYear = this.changeHorseBirthYear.bind(this)
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.changeHorseDescription = this.changeHorseDescription.bind(this)
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.changeHorseGaitSpeeds = this.changeHorseGaitSpeeds.bind(this)
    this.changeHorseHeightInches = this.changeHorseHeightInches.bind(this)
    this.changeHorseHeightHands = this.changeHorseHeightHands.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.changeHorseSex = this.changeHorseSex.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.pickPhoto = this.pickPhoto.bind(this)
    this.renderHandsPicker = this.renderHandsPicker.bind(this)

    this.debounce = false
  }

  pickPhoto () {
    if (!this.debounce) {
      this.debounce = true
      ImagePicker.openPicker({
        width: 1080,
        height: 1080,
        cropping: true,
      }).then(image => {
        this.debounce = false
        this.props.stashPhoto(image.path)
      }).catch(e => {
        this.debounce = false
        if (e.code && e.code === 'E_PERMISSION_MISSING') {
          Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
        } else {
          logError(e, 'UpdateHorse.UpdateHorse.pickPhoto')
        }
      })
    }
  }

  changeHorseDetails (newDetails) {
    this.props.horseUpdated(this.props.horse.merge(newDetails))
  }

  changeProfilePhotoID () {
    this.changeHorseDetails({
      profilePhotoID: this.props.selectedPhotoID
    })
    this.props.clearPhotoMenu()
  }

  deletePhoto () {
    this.props.markPhotoDeleted(this.props.selectedPhotoID)
    this.props.clearPhotoMenu()
  }

  changeHorseGaitSpeeds (newSpeeds) {
    this.props.markGaitSpeedsUpdated()
    this.changeHorseDetails({gaitSpeeds: newSpeeds})
  }

  changeHorseBirthDay (birthDay) {
    this.changeHorseDetails({ birthDay })
  }

  changeHorseSex (sex) {
    this.changeHorseDetails({ sex })
  }

  changeHorseBirthMonth (birthMonth) {
    this.changeHorseDetails({ birthMonth })
  }

  changeHorseBirthYear (birthYear) {
    this.changeHorseDetails({ birthYear })
  }

  changeHorseDescription (newDesc) {
    this.changeHorseDetails({
      description: newDesc
    })
  }

  changeHorseName (newName) {
    this.changeHorseDetails({
      name: newName
    })
  }

  changeHorseBreed (breed) {
    this.changeHorseDetails({ breed })
  }

  changeHorseHeightHands (newHands) {
    this.changeHorseDetails({
      heightHands: newHands
    })
  }

  changeHorseHeightInches (newInches) {
    this.changeHorseDetails({
      heightInches: newInches
    })
  }

  monthPicker (onValueChange) {
    const items = [
      { label: 'MM', value: null},
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
      <View style={{flex: 3, marginRight: 10}}>
        <EqPicker
          value={this.props.horse.get('birthMonth')}
          items={items}
          onValueChange={onValueChange}
        />
      </View>
    )
  }

  dayPicker (onValueChange) {
    const allDays = [{label: 'DD', value: null}]
    for (let i = 1; i <= 31; i++) {
      allDays.push({ label: i.toString(), value: i.toString() })
    }
    return (
      <View style={{flex: 2.5, marginRight: 10}}>
        <EqPicker
          value={this.props.horse.get('birthDay')}
          onValueChange={onValueChange}
          items={allDays}
        />
      </View>
    )
  }

  yearPicker (onValueChange) {
    const startYear = 1980
    const allYears = [{label: 'YYYY', value: null}]
    for (let i = startYear; i <= 2018; i++) {
      allYears.push({label: i.toString(), value: i.toString()})
    }
    return (
      <View style={{flex: 3}}>
        <EqPicker
          value={this.props.horse.get('birthYear')}
          onValueChange={onValueChange}
          items={allYears}
        />
      </View>
    )
  }

  sexPicker (onValueChange) {
    const items = [
      {label: "None", value: null},
      {label: "Mare", value: "Mare"},
      {label: "Stallion", value: "Stallion"},
      {label: "Gelding", value: "Gelding"},
      {label: "Other", value: "Other"},
    ]
    return (
      <View style={{flex: 1}}>
        <EqPicker
          value={this.props.horse.get('sex')}
          items={items}
          onValueChange={onValueChange}
        />
      </View>
    )
  }

  renderHandsPicker () {
    const handsItems = [
      { label: "Hands", value: null },
      { label: "8", value: "8" },
      { label: "9", value: "9" },
      { label: "10", value: "10" },
      { label: "11", value: "11" },
      { label: "12", value: "12" },
      { label: "13", value: "13" },
      { label: "14", value: "14" },
      { label: "15", value: "15" },
      { label: "16", value: "16" },
      { label: "17", value: "17" },
    ]
    const inchesItems = [
      { label: "Inches", value: null },
      { label: "0", value: "0" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
    ]
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{flex: 3, marginRight: 10}}>
          <EqPicker
            value={this.props.horse.get('heightHands')}
            onValueChange={this.changeHorseHeightHands}
            items={handsItems}
          />
        </View>
        <View style={{flex: 2}}>
          <EqPicker
            value={this.props.horse.get('heightInches')}
            onValueChange={this.changeHorseHeightInches}
            items={inchesItems}
          />
        </View>
      </View>
    )
  }

  render() {
    return (
      <View>
        <ColorModal
          initialColor={this.props.horse.get('color') || brand}
          changeColor={this.props.changeColor}
          modalOpen={this.props.colorModalOpen}
          onClosed={this.props.onColorModalClosed}
        />
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
          <View style={styles.container}>
            <View style={{flex: 1, padding: 5}}>
              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Profile Picture:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <PhotosByTimestamp
                    changeProfilePhoto={this.props.openPhotoMenu}
                    photosByID={this.props.horsePhotos}
                    profilePhotoID={this.props.horse.get('profilePhotoID')}
                  />
                </CardItem>
                { this.props.newHorse ? <PhotoFab pickPhoto={this.pickPhoto} /> : null }
              </Card>


              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Name:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TextInput
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
                    value={this.props.horse.get('name')}
                    onChangeText={this.changeHorseName}
                    underlineColorAndroid={'transparent'}
                    maxLength={200}
                  />
                </CardItem>

                <CardItem header>
                  <Text style={{color: darkBrand }}>Description:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <TextInput
                    style={{
                      borderRadius: 4,
                      width: '100%',
                      height: 100,
                      padding: 10,
                      borderColor: darkBrand,
                      borderWidth: 1,
                      textAlignVertical: "top"
                    }}
                    value={this.props.horse.get('description')}
                    onChangeText={this.changeHorseDescription}
                    multiline={true}
                    numberOfLines={3}
                    underlineColorAndroid="transparent"
                    maxLength={5000}
                  />
                </CardItem>
              </Card>

              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Tack Color:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                  <TouchableOpacity
                    style={{height: 40, width: '100%', backgroundColor: this.props.horse.get('color') || brand, borderRadius: 4}}
                    onPress={this.props.openColorModal(true)}
                  />
                </CardItem>

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
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
                    value={this.props.horse.get('breed')}
                    onChangeText={this.changeHorseBreed}
                    underlineColorAndroid={'transparent'}
                    maxLength={500}
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

              <GaitSpeedCard
                changeHorseGaitSpeeds={this.changeHorseGaitSpeeds}
                gaitSpeeds={this.props.horse.get('gaitSpeeds') || DEFAULT_HORSE_SPEEDS}
              />

              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Settings:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <TouchableOpacity style={{flex: 1, flexDirection: 'row'}} onPress={this.props.setDefaultHorse}>
                    <View style={{flex: 1}}>
                      <Switch
                        value={this.props.horseUser.get('rideDefault')}
                        onValueChange={this.props.setDefaultHorse}
                      />
                    </View>
                    <View style={{flex: 6, justifyContent: 'center'}}>
                      <Text>This is my default horse for rides.</Text>
                    </View>
                  </TouchableOpacity>
                </CardItem>
              </Card>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <PhotoMenu
          changeProfilePhotoID={this.changeProfilePhotoID}
          clearPhotoMenu={this.props.clearPhotoMenu}
          deletePhoto={this.deletePhoto}
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
    paddingTop: 2
    ,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: brand,
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  placeholder: {}
});
