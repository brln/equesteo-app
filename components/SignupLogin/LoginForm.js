import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { darkBrand } from '../../colors'
import MultiPlatform from '../MultiPlatform'

export default class LoginForm extends MultiPlatform {
  renderAndroid () {
    return (
      <View>
        <Text>Email:</Text>
        <TextInput
          autoCapitalize={'none'}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onChangeText={this.props.changeEmail}
          onSubmitEditing={this.props.moveToPassword}
          ref={(i) => this.props.inputs['email'] = i}
          underlineColorAndroid="black"
        />
        <Text>Password:</Text>
        <TextInput
          autoCapitalize={'none'}
          onChangeText={this.props.changePassword}
          onSubmitEditing={this.props.submitLogin}
          secureTextEntry={true}
          ref={(i) => this.props.inputs['password'] = i}
          underlineColorAndroid="black"
        />
      </View>
    )
  }

  renderIOS () {
    return (
      <View>
        <TextInput
          autoCapitalize={'none'}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onChangeText={this.props.changeEmail}
          onSubmitEditing={this.props.moveToPassword}
          ref={(i) => this.props.inputs['email'] = i}
          placeholder={'Email'}
          style={{
            backgroundColor: 'white',
            height: 50,
            paddingLeft: 20
          }}
        />
        <TextInput
          autoCapitalize={'none'}
          onChangeText={this.props.changePassword}
          onSubmitEditing={this.props.submitLogin}
          secureTextEntry={true}
          ref={(i) => this.props.inputs['password'] = i}
          placeholder={'Password'}
          style={{
            backgroundColor: 'white',
            height: 50,
            marginTop: 20,
            marginBottom: 20,
            paddingLeft: 20
          }}
        />
      </View>
    )
  }

}
