import React, { PureComponent } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
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
          maxLength={200}
        />
        <Text>Password:</Text>
        <View>
          <TextInput
            autoCapitalize={'none'}
            onChangeText={this.props.changePassword}
            onSubmitEditing={this.props.submitLogin}
            secureTextEntry={!this.props.passwordVisible}
            ref={(i) => this.props.inputs['password'] = i}
            underlineColorAndroid="black"
            maxLength={200}
          />
          <View style={{position: 'absolute', right: 0, bottom: 5}}>
            <TouchableOpacity onPress={this.props.togglePasswordVisible}>
              <BuildImage source={this.props.passwordVisible ? require('../../img/notVisible.png') : require('../../img/visible.png')} style={{width: 30, height: 30}}/>
            </TouchableOpacity>
          </View>
        </View>
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
          maxLength={200}
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
          maxLength={200}
        />
      </View>
    )
  }

}
