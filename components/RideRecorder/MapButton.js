import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { Button } from 'native-base'

import FabImage from '../FabImage'

export default class MapButton extends PureComponent {
  render () {
    return (
      <View style={{padding: 5}}>
        <Button style={{ backgroundColor: this.props.color, width: 40, height: 40, borderRadius: 20 }} onPress={this.props.onPress}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <FabImage source={this.props.icon} height={20} width={30} />
          </View>
        </Button>
      </View>
    )
  }
}