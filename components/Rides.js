import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';


export default class Rides extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.selectRide = this.selectRide.bind(this)
  }

  selectRide (ride) {
    Navigation.showModal({
      screen: 'equestio.Ride',
      title: ride.name,
      passProps: { ride },
      navigatorStyle: {},
      navigatorButtons: {},
      animationType: 'slide-up',
    });
  }

  render() {
    const rideComps = this.props.rides.map((ride) => {
      return (
        <Text
          style={styles.rideTitle}
          key={ride.id}
          onPress={() => {this.selectRide(ride)}}
        >
          {ride.name}
        </Text>
      )
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
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rideTitle: {
    fontSize: 24
  }
});
