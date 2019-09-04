import { List } from 'immutable'
import React, { PureComponent } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  Switch,
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import MultiSlider from '@ptomasroos/react-native-multi-slider'

import { brand, darkBrand, darkGrey } from '../../colors'
import FabImage from '../FabImage'
import HorseSelector from './HorseSelector'
import PhotosByTimestamp from '../PhotosByTimestamp'
import PhotoMenu from '../PhotoMenu'
import SelectHorseMenu from './SelectHorseMenu'
import ViewingMap from '../Ride/ViewingMap'
import Amplitude, { ADD_RIDE_PHOTO, TRIM_RIDE } from '../../services/Amplitude'
import CustomMarker from './CustomMarker'

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
    this.handleBackPress = this.handleBackPress.bind(this)
    this.startTrim = this.startTrim.bind(this)
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress () {
    this.props.clearMenus()
    return true
  }

  deletePhoto () {
    this.props.markPhotoDeleted(this.props.selectedPhotoID)
  }

  changeCoverPhoto () {
    this.props.changeCoverPhoto(this.props.selectedPhotoID)
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
      cropping: true,
    }).then(image => {
      Amplitude.logEvent(ADD_RIDE_PHOTO)
      this.props.createPhoto(image.path)
    }).catch((e) => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via iOS settings for Equesteo.')
      } else {
        this.props.logError(e, 'UpdateRide.UpdateRide.createPhoto')
      }
    })
  }

  startTrim () {
    Amplitude.logEvent(TRIM_RIDE)
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
    if (this.props.ride) {
      const height = (width * 9 / 16) + 54
      const numCoords = this.props.rideCoordinates.get('rideCoordinates').count()

      let trimButton = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.startTrim}>
          <Text style={{fontSize: 12}}>Trim</Text>
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
                values={[0, numCoords - 1]}
                min={0}
                max={numCoords}
                onValuesChange={this.props.trimRide}
                trackStyle={{
                  backgroundColor: darkGrey
                }}
                selectedStyle={{
                  backgroundColor: brand
                }}
                customMarker={(e) => {
                  return (
                    <CustomMarker
                      currentValue={e.currentValue}
                      enabled={true}
                      rideCoordinates={this.props.rideCoordinates}
                    />
                  )
                }}
              />
            </View>
          </CardItem>
        )
      }

      return (
        <View>
          <KeyboardAwareScrollView>
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
                    style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
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
                    horses={this.props.horses}
                    horsePhotos={this.props.horsePhotos}
                    openSelectHorseMenu={this.props.openSelectHorseMenu}
                    rideHorses={this.props.rideHorses}
                    unselectHorse={this.props.unselectHorse}
                  />
                </View>
              </Card>

              <Card>
                <CardItem header>
                  <Text style={{color: darkBrand }}>Accessibility:</Text>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={styles.switch}>
                      <Switch
                        value={this.props.ride.get('publiclyAccessible')}
                        onValueChange={this.props.changePubliclyAccessible}
                      />
                    </View>
                    <View style={{flex: 6, justifyContent: 'center'}}>
                      <Text>This whole ride is publicly accessible.</Text>
                    </View>
                  </View>
                </CardItem>
                <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={styles.switch}>
                      <Switch
                        value={this.props.ride.get('containsPrivateProperty')}
                        onValueChange={this.props.changePrivateProperty}
                      />
                    </View>
                    <View style={{flex: 6, justifyContent: 'center'}}>
                      <Text>This ride goes through private property and you need landowner permission.</Text>
                    </View>
                  </View>
                </CardItem>
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
                      borderRadius: 4,
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
                    <View style={styles.switch}>
                      <Switch
                        value={this.props.ride.get('isPublic')}
                        onValueChange={this.props.changePublic}
                      />
                    </View>
                    <View style={{flex: 6, justifyContent: 'center'}}>
                      <Text>Show this ride on other people's feed.</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          </KeyboardAwareScrollView>
          <PhotoMenu
            changeProfilePhotoID={this.changeCoverPhoto}
            deletePhoto={this.deletePhoto}
            selectedPhotoID={this.props.selectedPhotoID}
            visible={this.props.showPhotoMenu}
          />
          <SelectHorseMenu
            horseID={this.props.selectedHorseID}
            selectHorse={this.props.selectHorse}
            visible={this.props.showSelectHorseMenu}
          />
        </View>
      )
    } else {
      return null
    }
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
  switch: {
    flex: 1,
    marginRight: Platform.select({ios: 20, android: 0}),
  },
});
