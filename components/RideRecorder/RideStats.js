import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TimeElapsed from './TimeElapsed'

export default RideStats = (props) => {
  return (
    <View style={styles.rideStats}>
      <TimeElapsed
        startTime={props.startTime}
        fontStyle={styles.statFont}
      />
      <View>
        <Text
          style={styles.statFont}
        >
          { props.totalDistance.toFixed(2).toString() } mi
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rideStats: {
    position: 'absolute',
  },
  statFont: {
    color: 'white',
    fontSize: 35,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    textAlign: 'center',
    paddingLeft: 20,
  }
});
