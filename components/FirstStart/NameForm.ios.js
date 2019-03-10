import React from 'react'
import { Dimensions, Text, TextInput, View } from 'react-native'

import { brand } from '../../colors'

const { width } = Dimensions.get('window')


export default function NameForm (props) {
  return (
    <View style={{flex: 1, paddingTop: 30, width: width * .66}}>
      <Text style={{fontSize: 12}}>First</Text>
      <TextInput
        value={props.user.get('firstName')}
        autoFocus={true}
        blurOnSubmit={false}
        keyboardType={'email-address'}
        onChangeText={props.changeFirstName}
        onSubmitEditing={() => {props.inputs['lastName'].focus()}}
        ref={(i) => props.inputs['firstName'] = i}
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

      <Text style={{fontSize: 12}}>Last</Text>
      <TextInput
        value={props.user.get('lastName')}
        blurOnSubmit={false}
        keyboardType={'email-address'}
        onChangeText={props.changeLastName}
        onSubmitEditing={props.nextPage}
        ref={(i) => props.inputs['lastName'] = i}
        style={{
          backgroundColor: 'white',
          height: 50,
          borderWidth: 1,
          borderColor: 'black',
          minWidth: 220,
          paddingLeft: 10
        }}
        maxLength={200}
      />
    </View>
  )
}