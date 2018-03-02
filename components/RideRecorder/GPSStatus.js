import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';

export default GPSStatus = (props) => {
    let positionFound = <Text style={styles.locationNotFound}>Location Not Found</Text>
    if (props.hasPosition) {
      positionFound = <Text style={styles.locationFound}>Location Found!</Text>
    }
    return positionFound
}

const styles = StyleSheet.create({
  locationFound: {
    color: "green",
  },
  locationNotFound: {
    color: "red",
  },
});
