import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  Picker,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modalbox';

import {
  Text,
  View,
} from 'react-native';

import Button from '../Button'
import { brand, darkBrand, lightGrey } from '../../colors'
import EqPicker from '../EqPicker'
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
    }, [{ label: 'All Horses', value: this.props.types.SHOW_ALL_HORSES }])
    items.push({ label: "Rides With No Horse", value: this.props.types.NO_HORSE })
    return (
        <EqPicker
          value={this.props.chosenHorseID}
          items={items}
          onValueChange={this.props.pickHorse}
        />
    )
  }

  typePicker () {
    return (
      <EqPicker
        value={this.props.chosenType}
        items={[
          {label: 'Distance', value: this.props.types.DISTANCE},
          {label: 'Time', value: this.props.types.TYPE_TIME},
          {label: 'Elevation Gain', value: this.props.types.TYPE_GAIN}
        ]}
        onValueChange={this.props.pickType}
      />
    )
  }

  userPicker () {
    const items = [
      {label: 'Show All Riders', value: this.props.types.SHOW_ALL_RIDERS},
      {label: 'Only You', value: this.props.userID}
    ]
    const userItems = this.props.riders.valueSeq().reduce((a, r) => {
      a.push({ label: userName(r), value: r.get('_id') })
      return a
    }, [])
    const allItems = [...items, ...userItems]
    return (
      <EqPicker
        value={this.props.chosenUserID}
        items={allItems}
        onValueChange={this.props.pickRider}
      />
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
