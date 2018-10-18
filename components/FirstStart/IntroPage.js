import React, { PureComponent } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'

const { width } = Dimensions.get('window')

export default class NamePage extends PureComponent {
  render() {
    logRender('IntroPage')
    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={{
            fontSize: 30,
            fontFamily: 'Montserrat-Regular',
            color: 'black',
            textAlign: 'center'
          }}>
            Welcome To Equesteo!
          </Text>
        </View>
        <View style={styles.container}>
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center', fontSize: 20}}>Let's get you set up to ride.</Text>
          </View>
          <View style={{flex: 3}}>
            <Button
              color={brand}
              text={"Get Started"}
              onPress={this.props.nextPage}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 2,
    alignItems: 'center',
  },
});
