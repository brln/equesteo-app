import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';


export default class Rides extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    const rideComps = this.props.rides.map((ride) => {
      return <Text key={ride.start_time}>{ride.start_time}</Text>
    })
    return (
      <View style={styles.container}>
        {rideComps}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
});
