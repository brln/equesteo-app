import React, { PureComponent } from 'react'
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'
import HorseForm from './HorseForm'

const { height, width } = Dimensions.get('window')

export default class FirstHorsePage extends PureComponent {
  constructor (props) {
    super(props)
    this.next = this.next.bind(this)
    this.skipHorse = this.skipHorse.bind(this)
  }

  skipHorse () {
    this.props.setSkip(this.props.pages.FIRST_HORSE_PHOTO.name, this.props.nextPage)
  }

  next () {
    Keyboard.dismiss()
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
          <HorseForm
            changeHorseBreed={this.props.changeHorseBreed}
            changeHorseName={this.props.changeHorseName}
            horse={this.props.horse}
            inputs={this.props.inputs}
            next={this.next}
          />

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
