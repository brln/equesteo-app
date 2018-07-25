import React, { Component } from 'react';
import {
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base';

import { darkBrand } from '../colors'
import PhotosByTimestamp from './PhotosByTimestamp'


export default class UpdateHorse extends Component {
  constructor (props) {
    super(props)
    this.changeHorseBirthDay = this.changeHorseBirthDay.bind(this)
    this.changeHorseBirthMonth = this.changeHorseBirthMonth.bind(this)
    this.changeHorseBirthYear = this.changeHorseBirthYear.bind(this)
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.changeHorseDescription = this.changeHorseDescription.bind(this)
    this.changeHorseHeightInches = this.changeHorseHeightInches.bind(this)
    this.changeHorseHeightHands = this.changeHorseHeightHands.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.renderHandsPicker = this.renderHandsPicker.bind(this)
    this.changeHorseSex = this.changeHorseSex.bind(this)
    this.changeProfilePhotoID = this.changeProfilePhotoID.bind(this)
  }

  changeProfilePhotoID (profilePhotoID) {
    this.props.changeHorseDetails({ profilePhotoID })
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
    return (
      <View style={{borderColor: darkBrand, borderWidth: 1}}>
        <Picker
          selectedValue={this.props.horse.get('birthMonth')}
          style={{ height: 50, width: 100 }}
          onValueChange={onValueChange}
        >
          <Picker.Item label="" value={null} key="null"/>
          <Picker.Item label="Jan" value="1" key="1"/>
          <Picker.Item label="Feb" value="2" key="2"/>
          <Picker.Item label="Mar" value="3" key="3"/>
          <Picker.Item label="Apr" value="4" key="4"/>
          <Picker.Item label="May" value="5" key="5"/>
          <Picker.Item label="Jun" value="6" key="6"/>
          <Picker.Item label="Jul" value="7" key="7"/>
          <Picker.Item label="Aug" value="8" key="8"/>
          <Picker.Item label="Sep" value="9" key="9"/>
          <Picker.Item label="Oct" value="10" key="10"/>
          <Picker.Item label="Nov" value="11" key="11"/>
          <Picker.Item label="Dec" value="12" key="12"/>
        </Picker>
      </View>
    )
  }

  dayPicker (onValueChange) {
    const allDays = [<Picker.Item label="" value={null} key={null}/>]
    for (let i = 1; i <= 31; i++) {
      allDays.push(<Picker.Item label={i.toString()} value={i.toString()} key={i} />)
    }
    return (
      <View style={{borderColor: darkBrand, borderWidth: 1}}>
        <Picker
          selectedValue={this.props.horse.get('birthDay')}
          style={{ height: 50, width: 100 }}
          onValueChange={onValueChange}
        >
          {allDays}
        </Picker>
      </View>
    )
  }

  yearPicker (onValueChange) {
    const startYear = 1980
    const allDays = [<Picker.Item label="" value={null} key={null} />]
    for (let i = startYear; i <= 2018; i++) {
      allDays.push(<Picker.Item label={i.toString()} value={i.toString()} key={i} />)
    }
    return (
      <View style={{borderColor: darkBrand, borderWidth: 1}}>
        <Picker
          selectedValue={this.props.horse.get('birthYear')}
          style={{ height: 50, width: 100 }}
          onValueChange={onValueChange}
        >
          {allDays}
        </Picker>
      </View>
    )
  }

  sexPicker (onValueChange) {
    return (
      <View style={{borderColor: darkBrand, borderWidth: 1}}>
        <Picker
          selectedValue={this.props.horse.get('sex')}
          style={{ height: 50, width: 200 }}
          onValueChange={onValueChange}
        >
          <Picker.Item label="" value={null} />
          <Picker.Item label="Mare" value="Mare" />
          <Picker.Item label="Stallion" value="Stallion" />
          <Picker.Item label="Gelding" value="Gelding" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>
    )
  }

  renderHandsPicker () {
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{borderColor: darkBrand, borderWidth: 1}}>
          <Picker
            selectedValue={this.props.horse.get('heightHands')}
            onValueChange={this.changeHorseHeightHands}
            style={{ height: 50, width: 100 }}
          >
            <Picker.Item label="" value={null} />
            <Picker.Item label="11" value="11" />
            <Picker.Item label="12" value="12" />
            <Picker.Item label="13" value="13" />
            <Picker.Item label="14" value="14" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="16" value="16" />
            <Picker.Item label="17" value="17" />
          </Picker>
        </View>
        <View style={{borderColor: darkBrand, borderWidth: 1}}>
          <Picker
            selectedValue={this.props.horse.get('heightInches')}
            style={{ height: 50, width: 80 }}
            onValueChange={this.changeHorseHeightInches}
          >
            <Picker.Item label="" value={null} />
            <Picker.Item label="0" value="0" />
            <Picker.Item label="1" value="1" />
            <Picker.Item label="2" value="2" />
            <Picker.Item label="3" value="3" />
          </Picker>
        </View>
      </View>
    )
  }

  render() {
    return (
      <ScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.container}>
          <View style={{flex: 1, padding: 5}}>
            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Name:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
                <TextInput
                  style={{width: '100%'}}
                  value={this.props.horse.get('name')}
                  onChangeText={this.changeHorseName}
                  underlineColorAndroid={darkBrand}
                />
              </CardItem>

              <CardItem header>
                <Text style={{color: darkBrand }}>Description:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <TextInput
                  style={{width: '100%', borderColor: darkBrand, borderWidth: 1}}
                  value={this.props.horse.get('description')}
                  onChangeText={this.changeHorseDescription}
                  multiline={true}
                  numberOfLines={3}
                  underlineColorAndroid="white"
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
                  style={{width: '100%'}}
                  value={this.props.horse.get('breed')}
                  onChangeText={this.changeHorseBreed}
                  underlineColorAndroid={darkBrand}
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

            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Profile Picture:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <PhotosByTimestamp
                  changeProfilePhoto={this.changeProfilePhotoID}
                  photosByID={this.props.horse.get('photosByID')}
                  profilePhotoID={this.props.horse.get('profilePhotoID')}
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
