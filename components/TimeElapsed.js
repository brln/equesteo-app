import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class TimeElapsed extends Component<Props> {
  constructor (props) {
    super(props)
    this.renderTimer = setInterval(() => {
      this.forceUpdate()
    }, 100)

    this.state = {
      startingTime: this.props.startingTime,
    }

    this.elapsedAsString = this.elapsedAsString.bind(this)
  }

  componentWillUnmount() {
    clearInterval(this.renderTimer)
  }

  elapsedAsString () {
    const elapsed = new Date(new Date() - this.state.startingTime)
    const hours = elapsed.getUTCHours().toString().padStart(2, '0')
    const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0')
    const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`

  }

  render() {
    // @Todo Figure out why this is sometimes delayed in showing up.
    return (
      <Text style={styles.statFont}>Time Elapsed: {this.elapsedAsString()}</Text>
    );
  }
}

const styles = StyleSheet.create({
  statFont: {
    fontSize: 25
  }
});
