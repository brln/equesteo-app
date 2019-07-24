import React, { PureComponent } from 'react'
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../../components/Images/BuildImage'

const { width, height } = Dimensions.get('window')

export default class PageWrapper extends PureComponent {
  openEmail () {
    const subject = 'Help me Equesteo!'
    const email = 'info@equesteo.com'
    const url = (Platform.OS === 'android')
      ? `mailto:${email}?cc=?subject=${subject}`
      : `mailto:${email}?cc=&subject=${subject}`
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        console.log("Can't handle url: " + url);
      } else {
        return Linking.openURL(url);
      }
    })
    .catch((err) => console.error('An error occurred', err));
  }

  render() {
    const error = this.props.error ? <Text style={styles.errorBox}>{this.props.error}</Text> : null
    return (
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps={'always'}
          >
            <View style={{height: height - StatusBar.currentHeight || 0}}>
              <BuildImage
                source={require('../../img/loginbg4.jpg')}
                style={{ width, height, resizeMode: 'cover' }}
              />
              { this.props.children }
              { error }
            </View>
          </ScrollView>

          <View style={{position: 'absolute', bottom: 5, left: 0, width}}>
            <TouchableOpacity onPress={this.openEmail}>
              <Text style={{color: '#FFFFFF', fontSize: 14, textAlign: "center"}}>Email info@equesteo.com for help!</Text>
            </TouchableOpacity>
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

