import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Button,
  Dimensions,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';

import {
  Text,
  View,
} from 'react-native';

const { height, width } = Dimensions.get('window')

export default class PaceExplanationModal extends PureComponent {
  render () {
    return (
      <Modal
        coverScreen={true}
        style={styles.modal}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.closeModal}
      >
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>This is not a fancy gait analysis, just an estimate based on your speed.</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>The gait speeds are estimated as follows:</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>Walk: 0 - 6 mph</Text>
          <Text style={{textAlign: 'center'}}>Trot: 6 - 12 mph</Text>
          <Text style={{textAlign: 'center'}}>Canter: 12 - 25 mph</Text>
          <Text style={{textAlign: 'center'}}>Gallop: > 25 mph</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>If you think we're wrong, or have strong feelings about this, we'd love to hear about it. info@equesteo.com</Text>
        </View>
      </Modal>
    )
  }
}

PaceExplanationModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height / 4,
    height: height / 2,
    width: width * .8,
  },
})
