import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

import { brand, darkGrey, lightGrey } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../Button'
import Amplitude, {
  SKIP_FIRST_START_FOREVER
} from "../../services/Amplitude"

export default class NamePage extends PureComponent {
  constructor (props) {
    super(props)
    this.skipForever = this.skipForever.bind(this)
  }

  skipForever () {
    Amplitude.logEvent(SKIP_FIRST_START_FOREVER)
    this.props.done(true)
  }

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
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{padding: 5}}>
                <Button
                  borderColor={lightGrey}
                  color={"transparent"}
                  text={"Skip Forever"}
                  otherTextStyle={{color: darkGrey}}
                  onPress={this.skipForever}
                />
              </View>
              <View style={{padding: 5}}>
                <Button
                  color={brand}
                  text={"Get Started"}
                  onPress={this.props.nextPage}
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
  container: {
    paddingTop: 50,
    flex: 2,
    alignItems: 'center',
  },
});
