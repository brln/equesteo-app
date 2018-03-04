import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default class RideDetails extends Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      rideName: null
    }
    this.changeRideName = this.changeRideName.bind(this)
    this.dontSaveRide = this.dontSaveRide.bind(this)
    this.saveRide = this.saveRide.bind(this)
  }

  changeRideName (text) {
    this.setState({
      rideName: text
    })
  }

  saveRide () {
    this.props.saveRide(this.state.rideName)
  }

  dontSaveRide() {
    this.props.dontSaveRide()
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
