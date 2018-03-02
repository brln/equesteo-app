import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';


export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.props.ride.name}</Text>
        <Text>{this.props.ride.start_time}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
