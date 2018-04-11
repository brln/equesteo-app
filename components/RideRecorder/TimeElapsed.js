import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

const initialState = {
  starting: null,
  elapsedTime: undefined
}

export default class TimeElapsed extends Component {
  constructor (props) {
    super(props)
    this.state = { ...initialState }
    this.elapsedAsString = this.elapsedAsString.bind(this)
  }

  componentDidMount() {
    if (this.props.startTime && !this.state.startTime) {
      this.setState({
        startTime: this.props.startTime,
        elapsedTime: new Date(new Date() - this.props.startTime)
      })
      this.renderTimer = setInterval(() => {
        this.setState({
          elapsedTime: new Date(new Date() - this.state.startTime)
        })
      }, 100)
    }
  }

  componentWillUnmount() {
    this.setState({ ...initialState })
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
      <Text style={this.props.fontStyle}>{this.elapsedAsString()}</Text>
    );
  }
}

const styles = StyleSheet.create({
  statFont: {
    fontSize: 30,
    textAlign: 'center'
  }
});
