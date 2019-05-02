import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';

import {
  Text,
  View,
} from 'react-native';

import Button from '../Button'
import { brand, danger } from '../../colors'

const { height, width } = Dimensions.get('window')

export default class HoofTracksModal extends PureComponent {
  render () {
    return (
      <Modal
        coverScreen={true}
        style={[styles.modal, styles.modal3]}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.closeModal}
      >
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>This will start HoofTracks.</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
            <View style={{margin: 20, width: 80}} >
              <Button text={"Yes"} color={danger} onPress={this.props.onPress}/>
            </View>
            <View style={{margin: 20, width: 80}} >
              <Button text={"No"} color={brand} onPress={this.props.closeModal}/>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal3: {
    marginTop: height / 4,
    height: height / 3.5,
    width: width * .8,
  },
});
