import React, { Component } from 'react';
import {
  Button,
  Picker,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default class RideDetails extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      rideName: null,
      horseID: null,
    }
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.dontSaveRide = this.dontSaveRide.bind(this)
    this.renderHorses = this.renderHorses.bind(this)
    this.saveRide = this.saveRide.bind(this)
  }

  changeRideName (text) {
    this.setState({
      rideName: text
    })
  }

  changeHorseID (horseID) {
    this.setState({
      horseID: horseID
    })
  }

  saveRide () {
    let horseID = this.state.horseID
    if (!horseID && this.props.horses.length > 0) {
      horseID = this.props.horses[0].id
    }
    this.props.saveRide({
      name: this.state.rideName,
      horseID: horseID,
    })
  }

  dontSaveRide() {
    this.props.dontSaveRide()
  }

  renderHorses () {
    const horseComps = []
    for (let horse of this.props.horses) {
      horseComps.push(
        <Picker.Item
          key={horse.id}
          label={horse.name}
          value={horse.id}
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
          onChangeText={this.changeRideName}
          value={this.state.rideName}
        />
        <Text>Horse:</Text>
        <Picker
          selectedValue={this.state.horseID}
          onValueChange={this.changeHorseID}
        >
          {this.renderHorses()}
        </Picker>
        <View style={styles.buttons}>
          <View style={styles.buttonPad}>
            <Button style={styles.saveButton} onPress={this.dontSaveRide} title="Don't Save"/>
          </View>

          <View style={styles.buttonPad}>
            <Button style={styles.saveButton} onPress={this.saveRide} title="Save Ride"/>
          </View>
        </View>
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
