import React, { PureComponent } from 'react'
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { RELEASE } from '../../dotEnv'
import BuildImage from '../../components/Images/BuildImage'

const { width, height } = Dimensions.get('window')

export default class PageWrapper extends PureComponent {
  render() {
    const error = this.props.error ? <Text style={styles.errorBox}>{this.props.error}</Text> : null
    return (
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps={'always'}
          >
            <View style={{height: height - StatusBar.currentHeight}}>
              <BuildImage
                source={require('../../img/loginbg4.jpg')}
                style={{ width, height, resizeMode: 'cover' }}
              />
              { this.props.children }
              { error }
            </View>
          </ScrollView>
          <View style={{position: 'absolute', bottom: 5, left: 5, width}}>
            <Text style={{color: '#b8b8b8', fontSize: 8}}>Version { RELEASE.split('-')[1] }</Text>
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  errorBox: {
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    width
  }
});

