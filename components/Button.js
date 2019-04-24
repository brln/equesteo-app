import PropTypes from 'prop-types'
import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { lightGrey, darkGrey } from '../colors'

export default class Button extends PureComponent {
  render () {
    if (this.props.disabled) {
      return (
        <View
          style={[{width: this.props.width, backgroundColor: lightGrey}, styles.button]}
        >
          <Text style={[styles.text, {color: darkGrey}]}>{this.props.text}</Text>
        </View>
      )
    } else {
      return (
        <TouchableOpacity
          style={[{width: this.props.width, backgroundColor: this.props.color, borderColor: this.props.borderColor, borderWidth: this.props.borderColor ? 1 : null}, styles.button]}
          onPress={this.props.onPress}
        >
          <Text style={[styles.text, this.props.otherTextStyle]}>{this.props.text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

Button.propTypes = {
  color: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  text:{
    color:'#fff',
    textAlign:'center',
    paddingLeft : 20,
    paddingRight : 20
  },
  button: {
    // marginRight:40,
    // marginLeft:40,
    alignSelf: 'center',
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    borderRadius:10,
  }
});
