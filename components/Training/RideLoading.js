import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native'
import Modal from 'react-native-modalbox';
import { View } from 'react-native';

import { darkBrand } from '../../colors'

const { height, width } = Dimensions.get('window')

export default class RideLoading extends PureComponent {
  render () {
    return (
      <Modal
        coverScreen={true}
        style={styles.modal}
        position={"top"}
        isOpen={this.props.modalOpen}
        animationDuration={0}
      >
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 56}}>
          <ActivityIndicator size="large" color={darkBrand} />
          <Text style={{textAlign: 'center', color: darkBrand}}>Loading Ride...</Text>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height,
    width: width,
  },
})
