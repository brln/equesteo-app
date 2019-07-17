import React, { PureComponent } from 'react'
import {
  Dimensions,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import BuildImage from '../Images/BuildImage'
import { logRender } from '../../helpers'


const { height, width } = Dimensions.get('window')

export default class Wrapper extends PureComponent {
  render() {
    logRender('FirstStart')
    return (
      <View>
        <View style={{height: height - 56, position: 'absolute'}}>
          <View style={{flex: 3, justifyContent: 'flex-end', backgroundColor: 'white'}}>
            <BuildImage
              source={require('../../img/firstStart.jpg')}
              style={{
                width,
                height: width,
                resizeMode: 'cover',
              }}
            />
          </View>
        </View>
        <KeyboardAwareScrollView style={{backgroundColor: 'transparent'}}>
          <View style={{
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'white',
            paddingTop: 20,
          }}>
            <BuildImage
              source={require('../../img/logo250.png')}
              style={{
                width: 60,
                height: 60,
                alignItems: 'center',
              }}
            />
          </View>
          { this.props.children }
        </KeyboardAwareScrollView>
      </View>
    )
  }
}

