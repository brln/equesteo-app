import React, { Component } from 'react';
import {
  Picker,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default class RideDetails extends Component<Props> {
  constructor (props) {
    super(props)
    this.renderHorses = this.renderHorses.bind(this)
  }

  renderHorses () {
    const horseComps = []
    for (let horse of this.props.horses) {
      horseComps.push(
        <Picker.Item
          key={horse._id}
          label={horse.name}
          value={horse._id}
        />
      )
    }
    return horseComps
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Ride Name:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={this.props.changeRideName}
          value={this.props.rideName}
        />
        <Text>Horse:</Text>
        <Picker
          selectedValue={this.props.horseID}
          onValueChange={this.props.changeHorseID}
        >
          {this.renderHorses()}
        </Picker>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  saveButton: {
    padding: 100
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonPad: {
    margin: 20
  }
});
