import React from 'react';
import {
  Text,
  TextInput,
  View
} from 'react-native';

import MultiPlatform from '../MultiPlatform'

export default class SignupForm extends MultiPlatform {
  renderAndroid () {
    return (
      <View>
        <Text>Email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onSubmitEditing={this.moveToPassword}
          onChangeText={this.changeEmail}
          returnKeyType="next"
          ref={(i) => this.props.inputs['email'] = i}
          underlineColorAndroid="black"
          maxLength={200}
        />
        <Text>Password:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          blurOnSubmit={false}
          onSubmitEditing={this.moveToPassword2}
          onChangeText={this.changePassword1}
          ref={(i) => this.props.inputs['pw1'] = i}
          returnKeyType="next"
          underlineColorAndroid="black"
          secureTextEntry={true}
          maxLength={200}
        />
        <Text>Password Again:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          secureTextEntry={true}
          onChangeText={this.changePassword2}
          ref={(i) => this.props.inputs['pw2'] = i}
          underlineColorAndroid="black"
          maxLength={200}
        />
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
          onSubmitEditing={this.props.moveToPassword}
          ref={(i) => this.props.inputs['email'] = i}
          placeholder={'Email'}
          style={{
            backgroundColor: 'white',
            height: 50,
            paddingLeft: 20,
            borderWidth: 1,
            borderColor: 'black',
            marginBottom: 10,
          }}
          maxLength={200}
        />
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
        />
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
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
        />
      </View>
    )
  }

}
