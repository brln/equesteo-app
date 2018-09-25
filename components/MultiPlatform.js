import React, { PureComponent } from 'react';
import { isAndroid } from '../helpers'

export default class MultiPlatform extends PureComponent {
  render() {
    if (isAndroid()) {
      return this.renderAndroid()
    } else {
      return this.renderIOS()
    }
  }
}
