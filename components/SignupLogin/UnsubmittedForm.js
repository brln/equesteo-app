import React from 'react';
import {
  Text,
  TextInput,
  View
} from 'react-native';

import { brand } from '../../colors'
import Button from '../Button'
import MultiPlatform from '../MultiPlatform'

export default class UnsubmittedForm extends MultiPlatform {
  renderAndroid () {
    return (
      <View>
        <Text>Email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          autoFocus={true}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onSubmitEditing={this.props.getPWCode}
          onChangeText={this.props.changeEmail}
          returnKeyType="send"
          underlineColorAndroid="black"
          value={this.props.email}
          maxLength={200}
        />
        <Button text={'Submit'} color={brand} onPress={this.props.getPWCode}/>
      </View>
    )
  }

  renderIOS () {
    return (
      <View>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onChangeText={this.props.changeEmail}
          onSubmitEditing={this.props.getPWCode}
          ref={(i) => this.props.inputs['email'] = i}
          placeholder={'Email'}
          style={{
            backgroundColor: 'white',
            height: 50,
            paddingLeft: 20,
            borderWidth: 1,
            borderColor: 'black'
          }}
          maxLength={200}
        />
        <Button text={'Submit'} color={brand} onPress={this.props.getPWCode}/>
      </View>
    )
  }

}
