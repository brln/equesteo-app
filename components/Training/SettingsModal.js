import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';
import RNPickerSelect from 'react-native-picker-select';

import {
  Text,
  View,
} from 'react-native';

import Button from '../Button'
import { brand, darkBrand, lightGrey } from '../../colors'
import { userName } from '../../modelHelpers/user'

const { height, width } = Dimensions.get('window')

export default class SettingsModal extends PureComponent {
  constructor (props) {
    super(props)
    this.horsePicker = this.horsePicker.bind(this)
    this.typePicker = this.typePicker.bind(this)
    this.userPicker = this.userPicker.bind(this)
  }

  horsePicker () {
    const items = this.props.horseUsers.valueSeq().reduce((a, h) => {
      if (h.get('userID') === this.props.userID) {
        const horse = this.props.horses.get(h.get('horseID'))
        a.push({ label: horse.get('name'), value: horse.get('_id') })
      }
      return a
    }, [])
    items.push({ label: "Rides With No Horse", value: this.props.types.NO_HORSE })
    return (
      <View style={{borderWidth: 1, borderColor: darkBrand}}>
        <RNPickerSelect
          value={this.props.chosenHorseID}
          items={items}
          onValueChange={this.props.pickHorse}
          style={pickerSelectStyles}
          placeholder={{
            label: 'All Horses',
            value: this.props.types.SHOW_ALL_HORSES,
          }}
        />
      </View>
    )
  }

  typePicker () {
    return (
      <View style={{borderWidth: 1, borderColor: darkBrand}}>
        <RNPickerSelect
          value={this.props.chosenType}
          items={[
            {label: 'Distance', value: this.props.types.DISTANCE},
            {label: 'Time', value: this.props.types.TYPE_TIME},
            {label: 'Elevation Gain', value: this.props.types.TYPE_GAIN}
          ]}
          onValueChange={this.props.pickType}
          style={pickerSelectStyles}
        />
      </View>
    )
  }

  userPicker () {
    const items = [
      {label: 'Only You', value: this.props.userID}
    ]
    const userItems = this.props.riders.valueSeq().reduce((a, r) => {
      a.push({ label: userName(r), value: r.get('_id') })
      return a
    }, [])
    const allItems = [...items, ...userItems]

    return (
      <View style={{borderWidth: 1, borderColor: darkBrand}}>
        <RNPickerSelect
          value={this.props.chosenUserID}
          items={allItems}
          onValueChange={this.props.pickRider}
          style={pickerSelectStyles}
          placeholder={{
            label: 'All Riders',
            value: this.props.types.SHOW_ALL_RIDERS,
          }}
        />
      </View>
    )
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
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 30, paddingLeft: 20, paddingRight: 20}}>
          <View style={{height: '100%', width: width * 0.66}}>
            <View>
              <Text style={{color: darkBrand }}>Show Horse:</Text>
              { this.horsePicker() }
            </View>

            <View style={{paddingTop: 20}}>
              <Text style={{color: darkBrand }}>Show Rider:</Text>
              { this.userPicker() }
            </View>

            <View style={{paddingTop: 20}}>
              <Text style={{color: darkBrand }}>Show Data:</Text>
              { this.typePicker() }
            </View>

            <View style={{paddingTop: 20}}>
              <Button text={"Done"} color={brand} onPress={this.props.closeModal}/>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

SettingsModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: brand,
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  placeholder: {}
});
