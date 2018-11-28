import { List } from 'immutable'
import React, { PureComponent } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  Card,
  CardItem,
  CheckBox,
  Fab,
} from 'native-base'
import ImagePicker from 'react-native-image-crop-picker'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

import { brand, darkBrand, darkGrey } from '../../colors'
import FabImage from '../FabImage'
import HorseSelector from './HorseSelector'
import PhotosByTimestamp from '../PhotosByTimestamp'
import PhotoMenu from '../PhotoMenu'
import ViewingMap from '../Ride/ViewingMap'

const { width } = Dimensions.get('window')

export default class UpdateRide extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      trimming: false
    }
    this.changeCoverPhoto = this.changeCoverPhoto.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.changeRideNotes = this.changeRideNotes.bind(this)
    this.createPhoto = this.createPhoto.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.startTrim = this.startTrim.bind(this)
  }

  deletePhoto () {
    this.props.markPhotoDeleted(this.props.selectedPhotoID)
    this.props.clearPhotoMenu()
  }

  changeCoverPhoto () {
    this.props.changeCoverPhoto(this.props.selectedPhotoID)
    this.props.clearPhotoMenu()
  }

  changeRideName (name) {
    this.props.changeRideName(name)
  }

  changeRideNotes (notes) {
    this.props.changeRideNotes(notes)
  }

  createPhoto() {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.createPhoto(image.path)
    }).catch((e) => {})
  }

  startTrim () {
    this.setState({
      trimming: true
    })
  }

  showCoords (rideCoords, trimValues) {
    if (trimValues) {
      return rideCoords.reduce((a, rideCoord, i) => {
        if (i >= trimValues[0] && i <= trimValues[1]) {
          return a.push(rideCoord)
        } else {
          return a
        }
      }, List())
    } else {
      return rideCoords
    }
  }

  render() {
    const height = (width * 9 / 16) + 54
    const numCoords = this.props.rideCoordinates.get('rideCoordinates').count()

    let trimButton = (
      <Fab
        direction="up"
        style={{ backgroundColor: brand }}
        position="bottomRight"
        onPress={this.startTrim}>
        <FabImage source={require('../../img/trim.png')} height={30} width={30} />
      </Fab>
    )
    let trimmer = null
    if (this.state.trimming) {
      trimButton = null
      trimmer = (
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <MultiSlider
              sliderLength={width - 40}
              values={[0, numCoords]}
              min={0}
              max={numCoords}
              onValuesChange={this.props.trimRide}
              trackStyle={{
                backgroundColor: darkGrey
              }}
              selectedStyle={{
                backgroundColor: brand
              }}
              markerStyle={{
                backgroundColor: brand
              }}
            />
          </View>
        </CardItem>
      )
    }

    return (
      <View>
        <ScrollView>
          <View style={styles.container}>
            <Card style={{flex: 1}}>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Map</Text>
                </View>
              </CardItem>

              <View style={{height}}>
                <ViewingMap
                  rideCoordinates={this.showCoords(this.props.rideCoordinates.get('rideCoordinates'), this.props.trimValues)}
                  ridePhotos={this.props.ridePhotos}
                  showPhotoLightbox={this.props.showPhotoLightbox}
                />
              </View>
              { trimButton }
              { trimmer }
            </Card>

            {/*<Card>*/}
              {/*<CardItem header style={{padding: 5}}>*/}
                {/*<View style={{paddingLeft: 5}}>*/}
                  {/*<Text style={{color: darkBrand}}>Trim Ride</Text>*/}
                {/*</View>*/}
              {/*</CardItem>*/}
              {/*<CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>*/}
                  {/*<MultiSlider*/}
                    {/*sliderLength={width - 40}*/}
                    {/*values={[0, numCoords]}*/}
                    {/*min={0}*/}
                    {/*max={numCoords}*/}
                    {/*onValuesChange={this.props.trimRide}*/}
                  {/*/>*/}
              {/*</CardItem>*/}
            {/*</Card>*/}

            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Ride Photos</Text>
                </View>
              </CardItem>

              <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
                <PhotosByTimestamp
                  photosByID={this.props.ridePhotos}
                  profilePhotoID={this.props.ride.get('coverPhotoID')}
                  changeProfilePhoto={this.props.openPhotoMenu}
                />
              </CardItem>

              <View style={{paddingTop: 15}}>
                <Fab
                  direction="up"
                  style={{ backgroundColor: brand }}
                  position="bottomRight"
                  onPress={this.createPhoto}>
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
                  selectTextOnFocus={true}
                  style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
                  value={this.props.ride.get('name')}
                  onChangeText={this.changeRideName}
                  underlineColorAndroid={'transparent'}
                  maxLength={500}
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
                  horseID={this.props.ride.get('horseID')}
                  horses={this.props.horses}
                  horsePhotos={this.props.horsePhotos}
                />
              </View>
            </Card>

            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Notes:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <TextInput
                  style={{
                    width: '100%',
                    height: 150,
                    padding: 10,
                    borderColor: darkBrand,
                    borderWidth: 1,
                    textAlignVertical: "top"
                  }}
                  value={this.props.ride.get('notes')}
                  onChangeText={this.changeRideNotes}
                  multiline={true}
                  numberOfLines={3}
                  underlineColorAndroid="transparent"
                  maxLength={5000}
                />
              </CardItem>
            </Card>

            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Privacy</Text>
                </View>
              </CardItem>

              <View style={{marginLeft: 20, marginBottom: 30}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <CheckBox
                      checked={this.props.ride.get('isPublic')}
                      onPress={this.props.changePublic}
                    />
                  </View>
                  <View style={{flex: 6, justifyContent: 'center'}}>
                    <Text>Show this ride on other people's feed.</Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
        <PhotoMenu
          changeProfilePhotoID={this.changeCoverPhoto}
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
