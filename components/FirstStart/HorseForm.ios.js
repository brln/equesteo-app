import React from 'react'
import {
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  View
} from 'react-native'

import { brand } from '../../colors'

const { width } = Dimensions.get('window')


export default function HorseForm (props) {
  return (
    <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .66}}>
      <Text style={{fontSize: 12}}>Name</Text>
      <TextInput
        value={props.horse.get('name')}
        underlineColorAndroid={brand}
        blurOnSubmit={false}
        keyboardType={'email-address'}
        onChangeText={props.changeHorseName}
        onSubmitEditing={() => {props.inputs['breed'].focus()}}
        style={{
          backgroundColor: 'white',
          height: 50,
          borderWidth: 1,
          borderColor: 'black',
          marginBottom: 20,
          minWidth: 220,
          paddingLeft: 10
        }}
        maxLength={200}
      />

      <Text style={{fontSize: 12}}>Breed</Text>
      <TextInput
        value={props.horse.get('breed')}
        underlineColorAndroid={brand}
        blurOnSubmit={false}
        keyboardType={'email-address'}
        onChangeText={props.changeHorseBreed}
        ref={(i) => props.inputs['breed'] = i}
        onSubmitEditing={props.next}
        style={{
          backgroundColor: 'white',
          height: 50,
          borderWidth: 1,
          borderColor: 'black',
          marginBottom: 20,
          minWidth: 220,
          paddingLeft: 10
        }}
        maxLength={200}
      />
    </View>
  )
}