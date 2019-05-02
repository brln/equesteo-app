import React, { PureComponent } from 'react';
import {
  Text,
  View
} from 'react-native';
import * as Progress from 'react-native-progress';

import { brand, darkBrand } from '../../colors'

export default class Loader extends PureComponent {
  constructor () {
    super()
    this.state = {
      outOf: 0,
      done: 0,
      cheater: 0
    }
    this.cheaterInterval = null
  }

  static getDerivedStateFromProps (props, state) {
    const newState = {...this.state}
    const outOf = props.docsToDownload
    const done = props.docsDownloaded.valueSeq().reduce((a, x) => a + x, 0)
    if (done !== state.done) {
      const diff = ((state.done / state.outOf) + state.cheater) - ((done / outOf))
      newState.cheater = diff > 0 ? diff : 0
    }
    newState.outOf = outOf
    newState.done = done
    return newState
  }

  componentDidMount () {
    this.cheaterInterval = setInterval(() => {
      this.setState({
        cheater: this.state.cheater + 0.005
      })
    }, 250)
  }

  componentWillUnmount () {
    clearInterval(this.cheaterInterval)
  }

  render () {
    const progress = (this.state.done / this.state.outOf) + this.state.cheater || 0
    return (
      <View style={{paddingTop: this.props.paddingTop, alignItems: 'center'}}>
        <View style={{paddingBottom: this.props.paddingBottom}}>
          <Progress.Pie color={brand} indeterminate={this.state.outOf === 0} progress={progress} size={50} />
        </View>
        <Text style={{textAlign: 'center', color: darkBrand}}>Loading Data...</Text>
      </View>
    )
  }
}

