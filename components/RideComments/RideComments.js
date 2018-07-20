import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import CommentList from './CommentList'

export default class RideComments extends Component {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          New Comment:
        </Text>
        <TextInput
          onChangeText={this.props.updateNewComment}
          value={this.props.newComment}
        />
        <CommentList
          rideComments={this.props.rideComments}
          users={this.props.users}
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
