import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class PhotoLightbox extends Component {
  constructor (props) {
    super(props)
    this.close = this.close.bind(this)
  }

  close () {
    this.props.close()
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={this.props.source}
          style={{width: "95%", height: "95%"}}
        />
        <TouchableOpacity
          style={{flex: 1, position: 'absolute', top: '6%', right: '6%'}}
          onPress={this.close}
        >
          <Image source={require('../img/close.png')} style={{width: 50, height: 50}} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
