import ImagePicker from 'react-native-image-crop-picker'

import React, { PureComponent } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'

const { height, width } = Dimensions.get('window')

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
    }).catch(() => {})
  }

  next () {
    this.props.createHorse()
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
      <TouchableOpacity onPress={this.props.nextPage} style={{paddingTop: 10}}>
        <Text style={{textAlign: 'center', textDecorationLine: 'underline', color: "black", fontSize: 10}}>No, thanks.</Text>
      </TouchableOpacity>
    )
    let source = require('../../img/emptyHorse.png')

    if (this.props.horse.get('profilePhotoID')) {
      button = (
        <Button
          color={brand}
          text={"So cute! Continue"}
          onPress={this.next}
        />
      )
      skip = null
      source = {uri: this.props.horse.getIn(['photosByID', this.props.horse.get('profilePhotoID'), 'uri'])}
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
          <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .66, height: width * .66}}>
            <View style={{borderColor: brand, borderWidth: 5, backgroundColor: 'white'}}>
              <Image
                style={{width: '100%', height: '100%'}}
                source={source}
              />
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
