import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'

const { height, width } = Dimensions.get('window')

export default class NamePage extends PureComponent {
  constructor () {
    super()
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.nextPage = this.nextPage.bind(this)
  }

  changeFirstName (value) {
    const updated = this.props.user.set('firstName', value)
    this.props.updateUser(updated)
  }

  changeLastName (value) {
    const updated = this.props.user.set('lastName', value)
    this.props.updateUser(updated)
  }

  nextPage () {
    this.props.commitUpdateUser()
    this.props.nextPage()
  }

  render() {
    logRender('NamePage')
    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={{
            fontSize: 30,
            fontFamily: 'Montserrat-Regular',
            color: 'black',
            textAlign: 'center'
          }}>
            What's your name?
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .66}}>
            <Text style={{fontSize: 12}}>First</Text>
            <TextInput
              maxLength={40}
              value={this.props.user.get('firstName')}
              underlineColorAndroid={brand}
              autoFocus={true}
              blurOnSubmit={false}
              keyboardType={'email-address'}
              onChangeText={this.changeFirstName}
              onSubmitEditing={() => {this.props.inputs['lastName'].focus()}}
              ref={(i) => this.props.inputs['firstName'] = i}
              style={{
                backgroundColor: 'transparent',
                height: 50,
              }}
            />

            <Text style={{fontSize: 12}}>Last</Text>
            <TextInput
              maxLength={40}
              value={this.props.user.get('lastName')}
              underlineColorAndroid={brand}
              blurOnSubmit={false}
              keyboardType={'email-address'}
              onChangeText={this.changeLastName}
              onSubmitEditing={this.nextPage}
              ref={(i) => this.props.inputs['lastName'] = i}
              style={{
                backgroundColor: 'transparent',
                height: 50,
              }}
            />
          </View>
          <View style={{paddingTop: 20}}>
            <Button
              color={brand}
              text={"Go On"}
              onPress={this.nextPage}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
});
