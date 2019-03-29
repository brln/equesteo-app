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
    let setExplanation = null
    if (!this.props.paceHorse || !this.props.paceHorse.get('gaitSpeeds')) {
      setExplanation = (
        <Text style={{textAlign: 'center'}}>You can set the speeds for your particular horse by going to 'Edit' on their profile.</Text>
      )
    }
    return (
      <Modal
        coverScreen={true}
        style={styles.modal}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.closeModal}
      >
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>This is an estimate of gait based on speed.</Text>
          <Text />
          { setExplanation }
          <Text />
          <Text style={{textAlign: 'center'}}>The gait speeds for this horse are set to:</Text>
          <Text />
          <Text style={{textAlign: 'center'}}>Walk: 0 - {this.props.paces.walk.get(1)} mph</Text>
          <Text style={{textAlign: 'center'}}>Trot: {this.props.paces.trot.get(0)} - {this.props.paces.trot.get(1)}mph</Text>
          <Text style={{textAlign: 'center'}}>Canter: {this.props.paces.canter.get(0)} - {this.props.paces.canter.get(1)} mph</Text>
          <Text style={{textAlign: 'center'}}>Gallop: > {this.props.paces.gallop.get(0)} mph</Text>
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
