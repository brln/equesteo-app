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

const { height, width } = Dimensions.get('window')

export default class EmailInfoModal extends PureComponent {
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
          <Text style={{textAlign: 'center'}}>Your email should arrive within 5 minutes. You may need to check your spam folder.</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>Please contact us immediately with any problems, we'll get it figured out.</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>info@equesteo.com</Text>
        </View>
      </Modal>
    )
  }
}

EmailInfoModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height / 4,
    height: height / 3,
    width: width * .8,
  },
})
