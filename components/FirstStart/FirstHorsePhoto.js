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

import BuildImage from '../Images/BuildImage'
import { brand } from '../../colors'
import { logRender, logError } from '../../helpers'
import Button from '../Button'
import MedImage from '../Images/MedImage'

const { width } = Dimensions.get('window')

export default class FirstHorsePhoto extends PureComponent {
  constructor () {
    super()
    this.next = this.next.bind(this)
    this.uploadHorseProfile = this.uploadHorseProfile.bind(this)
  }

  uploadHorseProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.addHorseProfilePhoto(image.path)
    }).catch(e => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
      } else {
        logError(e)
      }
    })
  }

  next () {
    this.props.nextPage()
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
      <TouchableOpacity onPress={this.props.skipHorsePhoto} style={{paddingTop: 10}}>
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
          onPress={this.next}
        />
      )
      skip = null
      horseProfileImage = (
        <MedImage
          style={{width: '100%', height: '100%'}}
          source={{uri: this.props.horsePhotos.getIn([this.props.horse.get('profilePhotoID'), 'uri'])}}
          onError={e => logError("Can't load FirstHorsePhoto image")}
        />
      )
    }

    return (
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
    )
  }
}

const styles = StyleSheet.create({
});
