import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TimeElapsed from './TimeElapsed'

export default class RideStats extends PureComponent {
  render () {
    return (
      <View style={styles.rideStats}>
        <Text
          style={styles.statFont}
        >
          {this.props.distance.toFixed(2).toString()} mi
        </Text>
        <TimeElapsed
          appState={this.props.appState}
          startTime={this.props.startTime}
          fontStyle={styles.statFont}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  rideStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statFont: {
    color: 'black',
    fontSize: 35,
    textAlign: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  }
});
