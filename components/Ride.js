import React, { Component } from 'react';

import Map from './Map'

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
        <Map
          ride={this.props.ride}
        />
        <View>
          <Text>{this.props.ride.name}</Text>
          <Text>{this.props.ride.start_time}</Text>
        </View>
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
