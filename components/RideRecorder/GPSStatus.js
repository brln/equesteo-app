import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { green, danger } from '../../colors'

export default class GPSStatus extends PureComponent {
  render () {
    if (this.props.shown) {
      let positionFound = <Text style={styles.locationNotFound}>Location Not Found</Text>
      if (this.props.lastLocation) {
        positionFound = <Text style={styles.locationFound}>Location Found!</Text>
      }
      return (
        <View>
          {positionFound}
        </View>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  locationFound: {
    backgroundColor: green,
    color: "black",
    textAlign: 'center'
  },
  locationNotFound: {
    backgroundColor: danger,
    color: "white",
    textAlign: "center",
  },
});
