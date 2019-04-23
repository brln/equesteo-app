import slowlog from 'react-native-slowlog'
import React, { Component } from 'react';

export default class LoggedPureComponent extends Component {
  constructor (props) {
    super(props)
    slowlog(this, /.*/, {verbose: true})
  }
}
