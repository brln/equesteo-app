import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';

import {
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../Button'
import { brand, darkBrand } from '../../colors'

const { height, width } = Dimensions.get('window')

export default class AtlasEntryModal extends PureComponent {
  constructor (props) {
    super(props)
    this.createRideAtlasEntry = this.createRideAtlasEntry.bind(this)
  }

  createRideAtlasEntry () {
    this.props.createRideAtlasEntry().then(() => {
      this.props.closeModal()
    })
  }

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
          <View style={{paddingBottom: 20}}>
            <Text style={{textAlign: 'center', color: darkBrand}}>Name Your Entry</Text>
          </View>
          <View style={{paddingBottom: 20}}>
            <TextInput
              onChangeText={this.props.changeName}
              style={{width: width * 0.7, height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1}}
              value={this.props.name}
              underlineColorAndroid={'transparent'}
              maxLength={300}
              selectTextOnFocus={true}
            />
          </View>
          <Button text={"Save"} color={brand} onPress={this.createRideAtlasEntry}/>
        </View>
      </Modal>
    )
  }
}

AtlasEntryModal.propTypes = {
  changeName: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  name: PropTypes.string
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
