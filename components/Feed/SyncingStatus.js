import React, { PureComponent } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native'

const { width } = Dimensions.get('window')

export default class SyncingStatus extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    if (this.props.visible) {
      return (
        <View style={{width}}>
          <Text
            style={[styles.syncing, {backgroundColor: this.props.feedMessage.get('color')}]}
          >
            {this.props.feedMessage.get('message')}
          </Text>
        </View>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  syncing: {
    color: "black",
    textAlign: 'center'
  },
})
