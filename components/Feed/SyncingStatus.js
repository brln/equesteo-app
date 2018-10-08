import React, { PureComponent } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native'

const { width } = Dimensions.get('window')

export default class SyncingStatus extends PureComponent {
  constructor (props) {
    super(props)
    this.timeout = this.timeout.bind(this)
  }

  componentWillUnmount() {
    this.feedTimeout = null
  }

  timeout () {
    this.feedTimeout = setTimeout(() => {
      this.props.clearFeedMessage()
    }, this.props.feedMessage.get('timeout'))
  }

  render() {
    if (this.props.feedMessage.get('timeout') && !this.feedTimeout) {
      this.timeout()
    }
    return (
      <View style={{width}}>
        <Text
          style={[styles.syncing, {backgroundColor: this.props.feedMessage.get('color')}]}
        >
          {this.props.feedMessage.get('message')}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  syncing: {
    color: "black",
    textAlign: 'center'
  },
});
