import React, { Component } from 'react';

import {
  Button,
  StyleSheet,
  View
} from 'react-native';


export default class Account extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.signOut = this.signOut.bind(this)
  }

  signOut () {
    this.props.signOut()
  }

  render() {
    return (
      <View style={styles.container}>
        <Button onPress={this.signOut} title="Sign Out" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
