import ImagePicker from 'react-native-image-crop-picker'

import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import BuildImage from '../Images/BuildImage'
import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'
import MedImage from '../Images/MedImage'

const { width } = Dimensions.get('window')

export default class ProfilePhotoPage extends PureComponent {
  constructor () {
    super()
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadProfilePhoto(image.path)
    }).catch(() => {})
  }

  render() {
    logRender('ProfilePhotoPage')
    let button = (
      <Button
        color={brand}
        text={"Yes!"}
        onPress={this.uploadProfile}
      />
    )
    let skip = (
      <TouchableOpacity onPress={this.props.nextPage} style={{paddingTop: 10}}>
        <Text style={{fontSize: 10, textAlign: 'center', textDecorationLine: 'underline'}}>No, thanks.</Text>
      </TouchableOpacity>
    )
    let profilePhoto = (
      <TouchableOpacity onPress={this.uploadProfile} >
        <BuildImage
          source={require('../../img/emptyProfile.png')}
          style={{width: '100%', height: '100%'}}
        />
      </TouchableOpacity>
    )

    if (this.props.user.get('profilePhotoID')) {
      button = (
        <Button
          color={brand}
          text={"You look great! Continue"}
          onPress={this.props.nextPage}
        />
      )
      skip = null
      profilePhoto = (
        <MedImage
          source={{uri: this.props.userPhotos.getIn([this.props.user.get('profilePhotoID'), 'uri'])}}
          style={{width: '100%', height: '100%'}}
          onError={e => logError("Can't load FirstProfilePhoto image")}
        />
      )
    }

    return (
      <View style={{flex: 1}}>
        <View style={{paddingLeft: 20, paddingRight: 20}}>
          <Text style={{
            fontSize: 30,
            fontFamily: 'Montserrat-Regular',
            color: 'black',
            textAlign: 'center'
          }}>
            Upload a profile photo?
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .5, height: width * .5}}>
            <View style={{borderColor: brand, borderWidth: 5, backgroundColor: 'white'}}>
              { profilePhoto }
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
