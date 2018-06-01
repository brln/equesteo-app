import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import { Container, Content } from 'native-base';
import {
  Button,
  Image,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import PhotosByTimestamp from './PhotosByTimestamp'

export default class Horse extends Component {
  constructor (props) {
    super(props)
    this.changeHorseBirthDay = this.changeHorseBirthDay.bind(this)
    this.changeHorseBirthMonth = this.changeHorseBirthMonth.bind(this)
    this.changeHorseBirthYear = this.changeHorseBirthYear.bind(this)
    this.changeHorseDescription = this.changeHorseDescription.bind(this)
    this.changeHorseHeightInches = this.changeHorseHeightInches.bind(this)
    this.changeHorseHeightHands = this.changeHorseHeightHands.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {});
  }

  changeHorseBirthDay (newDay) {
    this.props.changeHorseDetails({
      birthDay: newDay
    })
  }

  changeHorseBirthMonth (newMonth) {
    this.props.changeHorseDetails({
      birthMonth: newMonth
    })
  }

  changeHorseBirthYear (newYear) {
    this.props.changeHorseDetails({
      birthYear: newYear
    })
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
    return (<Picker
      selectedValue={this.props.horse.birthMonth || "1"}
      style={{ height: 50, width: 120 }}
      onValueChange={onValueChange}
    >
      <Picker.Item label="Jan" value="1" />
      <Picker.Item label="Feb" value="2" />
      <Picker.Item label="Mar" value="3" />
      <Picker.Item label="Apr" value="4" />
      <Picker.Item label="May" value="5" />
      <Picker.Item label="Jun" value="6" />
      <Picker.Item label="Jul" value="7" />
      <Picker.Item label="Aug" value="8" />
      <Picker.Item label="Sep" value="9" />
      <Picker.Item label="Oct" value="10" />
      <Picker.Item label="Nov" value="11" />
      <Picker.Item label="Dec" value="12" />
    </Picker>)
  }

  dayPicker (onValueChange) {
    const allDays = []
    for (let i = 1; i <= 31; i++) {
      allDays.push(<Picker.Item label={i.toString()} value={i.toString()} key={i} />)
    }
    return (
      <Picker
        selectedValue={this.props.horse.birthDay || "1"}
        style={{ height: 50, width: 80 }}
        onValueChange={onValueChange}
      >
        {allDays}
      </Picker>
    )
  }

  yearPicker (onValueChange) {
    const startYear = 1970
    const allDays = []
    for (let i = startYear; i <= 2018; i++) {
      allDays.push(<Picker.Item label={i.toString()} value={i.toString()} key={i} />)
    }
    return (
      <Picker
        selectedValue={this.props.horse.birthYear || startYear.toString()}
        style={{ height: 50, width: 120 }}
        onValueChange={onValueChange}
      >
        {allDays}
      </Picker>
    )
  }

  render() {
    let source = require('../img/empty.png')
    let buttonText = 'Upload Photo'
    if (this.props.horse.profilePhotoID) {
      source = {uri: this.props.horse.photosByID[this.props.horse.profilePhotoID].uri}
      buttonText = 'Change Profile Photo'
    }

    return (
      <ScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <View style={{flex: 1, padding: 20}}>
              <Image style={styles.image} source={source} />
              <View style={styles.profileButton}>
                <Button onPress={this.uploadPhoto} title={buttonText} />
              </View>
            </View>
            <View style={{flex: 1, padding: 5, left: -15}}>
              <Text>Name:</Text>
              <TextInput
                value={this.props.horse.name}
                onChangeText={this.changeHorseName}
              />

              <Text>Height:</Text>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Picker
                  selectedValue={this.props.horse.heightHands || "14"}
                  style={{ height: 50, width: 80 }}
                  onValueChange={this.changeHorseHeightHands}
                >
                  <Picker.Item label="11" value="11" />
                  <Picker.Item label="12" value="12" />
                  <Picker.Item label="13" value="13" />
                  <Picker.Item label="14" value="14" />
                  <Picker.Item label="15" value="15" />
                  <Picker.Item label="16" value="16" />
                  <Picker.Item label="17" value="17" />
                </Picker>
                <Picker
                  selectedValue={this.props.horse.heightInches || "0"}
                  style={{ height: 50, width: 80 }}
                  onValueChange={this.changeHorseHeightInches}
                >
                  <Picker.Item label="0" value="0" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                </Picker>
              </View>



            </View>
          </View>
          <View style={{flex: 3, padding: 20}}>
            <Text>Birthday</Text>
            <View style={{flex: 1, flexDirection: 'row'}}>
              {this.monthPicker(this.changeHorseBirthMonth)}
              {this.dayPicker(this.changeHorseBirthDay)}
              {this.yearPicker(this.changeHorseBirthYear)}
            </View>

            <Text> Description: </Text>
            <TextInput
              value={this.props.horse.description}
              onChangeText={this.changeHorseDescription}
            />
          </View>
          <Container>
            <Content>
              <Text>Other Photos</Text>
              <PhotosByTimestamp
                photosByID={this.props.horse.photosByID}
                profilePhotoID={this.props.horse.profilePhotoID}
              />
            </Content>
          </Container>
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
