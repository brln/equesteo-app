import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { goodGreen, badRed } from '../../colors'

export default GPSStatus = (props) => {
    let positionFound = <Text style={styles.locationNotFound}>Location Not Found</Text>
    if (props.lastLocation) {
      positionFound = <Text style={styles.locationFound}>Location Found! Accurate to: {Math.round(props.lastLocation.accuracy)}m</Text>
    }
    return (
      <View style={styles.container}>
        {positionFound}
      </View>
    )
}

const styles = StyleSheet.create({
  locationFound: {
    backgroundColor: goodGreen,
    color: "black",
    textAlign: 'center'
  },
  locationNotFound: {
    backgroundColor: badRed,
    color: "white",
    textAlign: "center",
  },
});
