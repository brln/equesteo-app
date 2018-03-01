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
    this.state = {
      startingTime: null,
      elapsedTime: null,
    }
    this.elapsedAsString = this.elapsedAsString.bind(this)
  }

  componentDidMount() {
    if (this.props.startingTime && !this.state.startingTime) {
      this.setState({
        startingTime: this.props.startingTime,
        elapsedTime: new Date(new Date() - this.props.startingTime)
      })
      this.renderTimer = setInterval(() => {
        this.setState({
          elapsedTime: new Date(new Date() - this.state.startingTime)
        })
      }, 100)
    }
  }

  componentWillUnmount() {
    clearInterval(this.renderTimer)
  }

  elapsedAsString () {
    if (this.state.elapsedTime) {
      const elapsed = this.state.elapsedTime
      const hours = elapsed.getUTCHours().toString().padStart(2, '0')
      const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0')
      const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    } else {
      return '00:00:00'
    }


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
