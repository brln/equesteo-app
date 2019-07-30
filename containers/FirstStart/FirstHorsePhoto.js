import ImagePicker from 'react-native-image-crop-picker'

import React, { PureComponent } from 'react'
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import BuildImage from '../../components/Images/BuildImage'
import { brand } from '../../colors'
import { logInfo, generateUUID, unixTimeNow, logRender, logError } from '../../helpers'
import Button from '../../components/Button'
import MedImage from '../../components/Images/MedImage'
import { createHorsePhoto, horseUpdated } from '../../actions/standard'
import functional from '../../actions/functional'
import EqNavigation from '../../services/EqNavigation'
import { FINAL_PAGE } from '../../screens/consts/firstStart'
import Wrapper from '../../components/FirstStart/Wrapper'

const { width } = Dimensions.get('window')

class FirstHorsePhoto extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: 'transparent',
        },
        elevation: 0,
        backButton: {
          color: brand,
        },
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor () {
    super()
    this.addHorseProfilePhoto = this.addHorseProfilePhoto.bind(this)
    this.next = this.next.bind(this)
    this.nextWithPhoto = this.nextWithPhoto.bind(this)
    this.uploadHorseProfile = this.uploadHorseProfile.bind(this)
  }

  uploadHorseProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.addHorseProfilePhoto(image.path)
    }).catch(e => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
      } else {
        logError(e, 'FirstStart.FirstHorsePhoto.uploadHorsePhoto')
      }
    })
  }

  addHorseProfilePhoto (location) {
    let photoID = generateUUID()
    this.props.dispatch(createHorsePhoto(
      this.props.horse.get('_id'),
      this.props.userID,
      {
        _id: photoID,
        timestamp: unixTimeNow(),
        uri: location
      }
    ))
    this.props.dispatch(horseUpdated(this.props.horse.set('profilePhotoID', photoID)))
  }

  nextWithPhoto () {
    this.props.dispatch(functional.persistHorseWithPhoto(
      this.props.horse.get('_id'),
      this.props.horse.get('profilePhotoID')
    ))
    this.next()
  }

  next () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: FINAL_PAGE,
      }
    }).catch(() => {})
  }

  render() {
    logRender('FirstHorsePhoto')
    let button = (
      <Button
        color={brand}
        text={"Yes!"}
        onPress={this.uploadHorseProfile}
      />
    )
    let skip = (
      <TouchableOpacity onPress={this.next} style={{paddingTop: 10}}>
        <Text style={{textAlign: 'center', textDecorationLine: 'underline', color: "black", fontSize: 10}}>No, thanks.</Text>
      </TouchableOpacity>
    )
    let horseProfileImage = (
      <TouchableOpacity onPress={this.uploadHorseProfile} >
        <BuildImage
          style={{width: '100%', height: '100%'}}
          source={require('../../img/emptyHorse.png')}
        />
      </TouchableOpacity>
    )

    if (this.props.horse.get('profilePhotoID')) {
      button = (
        <Button
          color={brand}
          text={"So cute! Continue"}
          onPress={this.nextWithPhoto}
        />
      )
      skip = null
      horseProfileImage = (
        <MedImage
          style={{width: '100%', height: '100%'}}
          source={{uri: this.props.horsePhotos.getIn([this.props.horse.get('profilePhotoID'), 'uri'])}}
          onError={() => logInfo("Can't load FirstHorsePhoto image")}
        />
      )
    }

    return (
      <Wrapper>
        <View style={{flex: 1}}>
          <View>
            <Text style={{
              fontSize: 30,
              fontFamily: 'Montserrat-Regular',
              color: 'black',
              textAlign: 'center'
            }}>
              Got a cute picture of that horse?
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .5, height: width * .5}}>
              <View style={{borderColor: brand, borderWidth: 5, backgroundColor: 'white'}}>
                { horseProfileImage }
              </View>
            </View>
            <View style={{paddingTop: 20}}>
              { button }
              { skip }
            </View>
          </View>
        </View>
      </Wrapper>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const horseID = localState.getIn(['firstStartHorseID', 'horseID'])
  const horseUserID = localState.getIn(['firstStartHorseID', 'horseUserID'])
  return {
    horse: pouchState.getIn(['horses', horseID]),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUser: pouchState.getIn(['horseUsers', horseUserID]),
  }
}

export default connect(mapStateToProps)(FirstHorsePhoto)
