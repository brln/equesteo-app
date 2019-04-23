import slowlog from 'react-native-slowlog'
import React, { PureComponent } from 'react';

export default class LoggedPureComponent extends PureComponent {
  constructor (props) {
    super(props)
    slowlog(this, /.*/, {verbose: true})
  }
}
