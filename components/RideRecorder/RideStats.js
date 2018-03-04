import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TimeElapsed from './TimeElapsed'

export default RideStats = (props) => {
  return (
    <View >
      <TimeElapsed
        startingTime={props.startingTime}
      />
      <View>
        <Text style={styles.statFont}>{ props.totalDistance.toFixed(2).toString() } mi</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statFont: {
    fontSize: 75,
    textAlign: 'center'
  }
});
