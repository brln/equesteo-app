import React, { PureComponent } from 'react'
import { Text } from 'react-native'

export default class EqText extends PureComponent {
  render () {
    return <Text { ...this.props }>{this.props.children}</Text>
  }
}