import { ColorPicker } from 'react-native-color-picker'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'
import Modal from 'react-native-modalbox';

import Button from '../Button'
import { brand } from '../../colors'

const { height, width } = Dimensions.get('window')

export default class ColorModal extends PureComponent {
  render () {
    return (
      <Modal
        coverScreen={true}
        style={styles.modal}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.onClosed}
      >
        <View style={{flex: 1, width: '100%', height: '100%'}}>
          <ColorPicker
            defaultColor={this.props.initialColor}
            onColorChange={this.props.changeColor}
            style={{flex: 1}}
          />
          <View style={{paddingBottom: 25}}>
            <Button color={brand} onPress={this.props.onClosed} text={"Done"}/>
          </View>
        </View>
      </Modal>
    )
  }
}

ColorModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  onClosed: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.1,
    height: width,
    width: width * 0.8,
  },
});
