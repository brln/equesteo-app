import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default class Button extends PureComponent {
  render () {
    return (
      <TouchableOpacity
        style={[{backgroundColor: this.props.color}, styles.button]}
        onPress={this.props.onPress}
      >
        <Text style={styles.text}>{this.props.text}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  text:{
    color:'#fff',
    textAlign:'center',
    paddingLeft : 10,
    paddingRight : 10
  },
  button: {
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    borderRadius:10,
  }
});
