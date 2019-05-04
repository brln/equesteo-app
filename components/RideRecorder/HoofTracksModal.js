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
  constructor (props) {
    super(props)
    this.state = {
      startRide: false
    }
    this.setStart = this.setStart.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  setStart () {
    this.props.startHoofTracks()
  }

  cancel () {
    this.setState({
      startRide: false
    })
    this.props.closeModal()
  }

  render () {
    let main = (
      <View>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>Do you want to broadcast your ride using HoofTracks?</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
            <View style={{margin: 20, width: 80}} >
              <Button text={"Yes"} color={danger} onPress={this.setStart} />
            </View>
            <View style={{margin: 20, width: 80}} >
              <Button text={"No"} color={brand} onPress={this.props.closeModal}/>
            </View>
          </View>
        </View>
      </View>
    )
    if (this.props.hoofTracksRunning) {
      main = (
        <View>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
            <Text style={{textAlign: 'center'}}>This will stop HoofTracks.</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
              <View style={{margin: 20, width: 80}} >
                <Button text={"Yes"} color={danger} onPress={this.props.stopHoofTracks}/>
              </View>
              <View style={{margin: 20, width: 80}} >
                <Button text={"No"} color={brand} onPress={this.props.closeModal}/>
              </View>
            </View>
          </View>
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

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal3: {
    marginTop: height / 4,
    height: height / 2,
    width: width * .8,
  },
});
