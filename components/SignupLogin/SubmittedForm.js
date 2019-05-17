import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import Button from '../Button'
import { brand } from '../../colors'
import MultiPlatform from '../MultiPlatform'

export default class UnsubmittedForm extends MultiPlatform {
  renderAndroid () {
    return (
      <View>
        <Text style={{textAlign: 'center'}}>Enter the reset code from your email:</Text>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          autoFocus={true}
          blurOnSubmit={false}
          keyboardType={'email-address'}
          onSubmitEditing={this.props.submitResetCode}
          onChangeText={this.props.changeResetCode}
          returnKeyType="send"
          underlineColorAndroid="black"
          value={this.props.resetCode}
          maxLength={30}
        />
        <Button text={'Submit'} color={brand} onPress={this.props.submitResetCode}/>
        <View style={{paddingTop: 20}}>
          <TouchableOpacity onPress={() => {this.props.setEmailInfoModalOpen(true)}}>
            <Text style={styles.switchupText}><Text style={styles.underlineText}>Didn't get an email?</Text></Text>
          </TouchableOpacity>
        </View>
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
          onChangeText={this.props.changeResetCode}
          onSubmitEditing={this.props.submitResetCode}
          placeholder={'Reset Code from Your Email'}
          style={{
            backgroundColor: 'white',
            height: 50,
            paddingLeft: 20,
            borderWidth: 1,
            borderColor: 'black'
          }}
          maxLength={30}
        />
        <Button text={'Submit'} color={brand} onPress={this.props.submitResetCode}/>
        <View style={{paddingTop: 20}}>
          <TouchableOpacity onPress={() => {this.props.setEmailInfoModalOpen(true)}}>
            <Text style={styles.switchupText}><Text style={styles.underlineText}>Didn't get an email?</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  switchupText: {
    textAlign: 'center',
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
