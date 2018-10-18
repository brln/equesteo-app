import ImagePicker from 'react-native-image-crop-picker'

import React, { PureComponent } from 'react'
import {
  Dimensions,
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

export default class FirstHorsePage extends PureComponent {
  constructor () {
    super()
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.next = this.next.bind(this)
    this.skipHorse = this.skipHorse.bind(this)
  }

  changeHorseName (value) {
    this.props.updateHorse(this.props.horse.set('name', value))
  }

  changeHorseBreed (value) {
    this.props.updateHorse(this.props.horse.set('breed', value))
  }

  skipHorse () {
    this.props.setSkip(this.props.pages.FIRST_HORSE_PHOTO.name, this.props.nextPage)
  }

  next () {
    this.props.nextPage()
  }

  render() {
    logRender('FirstHorsePage')

    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={{
            fontSize: 30,
            fontFamily: 'Montserrat-Regular',
            color: 'black',
            textAlign: 'center'
          }}>
            Add your first horse!
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .66}}>
            <Text style={{fontSize: 12}}>Name</Text>
            <TextInput
              value={this.props.horse.get('name')}
              underlineColorAndroid={brand}
              blurOnSubmit={false}
              keyboardType={'email-address'}
              onChangeText={this.changeHorseName}
              onSubmitEditing={() => {this.props.inputs['breed'].focus()}}
              style={{
                backgroundColor: 'transparent',
                height: 50,
              }}
              maxLength={200}
            />

            <Text style={{fontSize: 12}}>Breed</Text>
            <TextInput
              value={this.props.horse.get('breed')}
              underlineColorAndroid={brand}
              blurOnSubmit={false}
              keyboardType={'email-address'}
              onChangeText={this.changeHorseBreed}
              ref={(i) => this.props.inputs['breed'] = i}
              style={{
                backgroundColor: 'transparent',
                height: 50,
              }}
              maxLength={200}
            />
          </View>


          <View style={{paddingTop: 20}}>
            <Button
              color={brand}
              text={"Go On"}
              onPress={this.next}
            />
          </View>

          <TouchableOpacity onPress={this.skipHorse} style={{paddingTop: 10}}>
            <Text style={{textAlign: 'center', textDecorationLine: 'underline', fontSize: 10, color: 'black'}}>Not now.</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
});
