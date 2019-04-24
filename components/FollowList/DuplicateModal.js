import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';
import PropTypes from 'prop-types'
import {
  Text,
  View,
} from 'react-native';

import Button from '../Button'
import { danger, brand } from '../../colors'


const { height, width } = Dimensions.get('window')

export default class DuplicateModal extends PureComponent {
  render () {
    let main = (
      <View>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>This feature is for when you ride with someone who forgot to record their ride, or they dropped their phone in a creek. Are you sure you want to duplicate this ride into their account?</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
            <View style={{margin: 20, width: 80}} >
              <Button text={"Yes"} color={danger} onPress={this.props.duplicateModalYes}/>
            </View>
            <View style={{margin: 20, width: 80}} >
              <Button text={"No"} color={brand} onPress={this.props.closeModal}/>
            </View>
          </View>
        </View>
      </View>
    )
    if (this.props.duplicationInProgress) {
      main = (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      )
    }

    return (
      <Modal
        coverScreen={true}
        style={[styles.modal, styles.modal3]}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.closeModal}
      >
        { main }
      </Modal>
    )
  }
}

DuplicateModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  duplicateModalYes: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal3: {
    marginTop: height / 6,
    height: height / 3,
    width: width * .8,
  },
});
