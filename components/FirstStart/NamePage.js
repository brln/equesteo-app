import React, { PureComponent } from 'react'
import {
  ScrollView,
  Text,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'
import NameForm from './NameForm'


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
          <NameForm
            changeFirstName={this.changeFirstName}
            changeLastName={this.changeLastName}
            nextPage={this.nextPage}
            inputs={this.props.inputs}
            user={this.props.user}
          />
          <View style={{flex: 1, paddingTop: 20}}>
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
