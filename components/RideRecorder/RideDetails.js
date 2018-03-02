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

  render() {
    return (
      <View style={styles.container}>
        <Text>Ride Name:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={this.changeRideName}
          value={this.state.rideName}
        />
        <Button style={styles.saveButton} onPress={this.saveRide} title="Save Ride"/>
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
  textInput: {
  },
  saveButton: {
    width: 80
  }
});
