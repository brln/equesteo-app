import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'

const { height, width } = Dimensions.get('window')

export default class FinalPage extends PureComponent {
  render() {
    logRender('FinalPage')

    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Text style={{
              fontSize: 30,
              fontFamily: 'Montserrat-Regular',
              color: 'black',
              textAlign: 'center'
            }}>
              You're all set!
            </Text>
          </View>
          <View style={{flex: 4}}>
            <View>
              <Text style={{textAlign: 'center', fontSize: 20, padding: 20}}>If you need any help, have ideas or concerns about the app, or just want to talk horses, email us!</Text>
            </View>
            <View>
              <Text style={{textAlign: 'center', fontSize: 20}}>info@equesteo.com</Text>
              <View style={{paddingTop: 20}}>
                <Button
                  color={brand}
                  text={"Got It"}
                  onPress={this.props.done}
                />
              </View>
            </View>
          </View>
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
});