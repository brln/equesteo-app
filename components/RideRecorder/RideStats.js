import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TimeElapsed from './TimeElapsed'

export default RideStats = (props) => {
  return (
    <View>
      <Text style={styles.statFont}>Latitude: {props.lastLat}</Text>
      <Text style={styles.statFont}>Longitude: {props.lastLong}</Text>
      <Text style={styles.statFont}>Altitude: {props.lastAltitude}</Text>
      <TimeElapsed
        startingTime={props.startingTime}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  statFont: {
    fontSize: 25
  }
});
