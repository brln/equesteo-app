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

export default class DiscardModal extends PureComponent {
  render () {
    return (
      <Modal
        coverScreen={true}
        style={[styles.modal, styles.modal3]}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.closeDiscardModal}
      >
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
          <Text style={{textAlign: 'center'}}>{this.props.text}</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
            <View style={{margin: 20, width: 80}} >
              <Button title={"Yes"} color={"red"} onPress={this.props.discardFunc}/>
            </View>
            <View style={{margin: 20, width: 80}} >
              <Button title={"No"} onPress={this.props.closeDiscardModal}/>
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
    marginTop: 30,
    height: height / 4,
    width: width * .8,
  },
});
