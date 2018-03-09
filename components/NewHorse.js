import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default class NewHorse extends Component {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      }
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      name: ''
    }
    this.changeName = this.changeName.bind(this);
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.props.saveNewHorse({
          name: this.state.name
        })
      }
    }
  }

  changeName (text) {
    this.setState({
      name: text
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Name:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={this.changeName}
          value={this.state.name}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
});
