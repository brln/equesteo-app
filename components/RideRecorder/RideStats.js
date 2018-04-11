import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TimeElapsed from './TimeElapsed'

export default RideStats = (props) => {
  return (
    <View style={styles.rideStats}>
      <Text
        style={styles.statFont}
      >
        { props.distance.toFixed(2).toString() } mi
      </Text>
      <TimeElapsed
        appState={props.appState}
        startTime={props.startTime}
        fontStyle={styles.statFont}
      />
    </View>
  )
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
