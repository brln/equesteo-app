import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default GPSStatus = (props) => {
    let positionFound = <Text style={styles.locationNotFound}>Location Not Found</Text>
    if (props.lastLocation) {
      positionFound = <Text style={styles.locationFound}>Location Found!</Text>
    }
    return (
      <View style={styles.container}>
        {positionFound}
      </View>
    )
}

const styles = StyleSheet.create({
  locationFound: {
    backgroundColor: 'green',
    color: "white",
    textAlign: 'center'
  },
  locationNotFound: {
    backgroundColor: 'red',
    color: "white",
    textAlign: "center",
  },
});
