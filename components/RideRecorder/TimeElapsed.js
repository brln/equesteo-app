import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

export default class TimeElapsed extends Component {
  constructor (props) {
    super(props)
    this.state = {
      startingTime: null,
      elapsedTime: undefined,
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

  leftpad(num) {
    const str = num.toString()
    const pad = "00"
    return pad.substring(0, pad.length - str.length) + str
  }

  elapsedAsString () {
    const elapsed = this.state.elapsedTime
    let hours = '00'
    let minutes = '00'
    let seconds = '00'
    if (!(typeof(elapsed) === 'undefined')) {
      hours = this.leftpad(elapsed.getUTCHours())
      minutes = this.leftpad(elapsed.getUTCMinutes())
      seconds = this.leftpad(elapsed.getUTCSeconds())
    }
    return `${hours}:${minutes}:${seconds}`
  }

  render() {
    return (
      <Text style={styles.statFont}>{this.elapsedAsString()}</Text>
    );
  }
}

const styles = StyleSheet.create({
  statFont: {
    fontSize: 90,
    textAlign: 'center'
  }
});
