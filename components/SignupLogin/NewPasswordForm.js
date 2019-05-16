import React from 'react';
import {
  Text,
  TextInput,
  View
} from 'react-native';

import { brand } from '../../colors'
import Button from '../Button'
import MultiPlatform from '../MultiPlatform'

export default class NewPasswordForm extends MultiPlatform {
  renderAndroid () {
    return (
      <View>
        <Text>Password:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          blurOnSubmit={false}
          onSubmitEditing={this.props.moveToPassword2}
          onChangeText={this.props.changePassword1}
          ref={(i) => this.props.inputs['pw1'] = i}
          returnKeyType="next"
          underlineColorAndroid="black"
          secureTextEntry={true}
          value={this.props.pw1}
          maxLength={200}
        />
        <Text>Password Again:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          onSubmitEditing={this.submitNewPassword}
          secureTextEntry={true}
          onChangeText={this.props.changePassword2}
          ref={(i) => this.props.inputs['pw2'] = i}
          underlineColorAndroid="black"
          value={this.props.pw2}
          maxLength={200}
        />
        <Button text={'Change Password'} color={brand} onPress={this.props.submitNewPassword}/>
      </View>
    )
  }

  renderIOS () {
    return (
      <View>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          onChangeText={this.props.changePassword1}
          onSubmitEditing={this.props.moveToPassword2}
          secureTextEntry={true}
          ref={(i) => this.props.inputs['pw1'] = i}
          placeholder={'Password'}
          style={{
            backgroundColor: 'white',
            height: 50,
            marginTop: 20,
            paddingLeft: 20,
            borderWidth: 1,
            borderColor: 'black'
          }}
          maxLength={200}
          value={this.props.pw1}
        />
        <TextInput
          autoCapitalize={'none'}
          onChangeText={this.props.changePassword2}
          secureTextEntry={true}
          ref={(i) => this.props.inputs['pw2'] = i}
          placeholder={'Password Again'}
          style={{
            backgroundColor: 'white',
            height: 50,
            marginTop: 20,
            marginBottom: 20,
            paddingLeft: 20,
            borderWidth: 1,
            borderColor: 'black'
          }}
          maxLength={200}
          value={this.props.pw2}
          onSubmitEditing={this.props.submitNewPassword}
        />
        <Button text={'Change Password'} color={brand} onPress={this.props.submitNewPassword}/>
      </View>
    )
  }

}
