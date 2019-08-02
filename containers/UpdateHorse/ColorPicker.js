import {ColorPicker, fromHsv} from 'react-native-color-picker'
import React, { PureComponent } from 'react'
import {
  View,
} from 'react-native'

import { brand } from '../../colors'
import {connect} from "react-redux"
import {horseUpdated} from "../../actions/standard"


class ColorPickerContainer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      chosenColor: props.horse.get('color')
    }

    this.changeColor = this.changeColor.bind(this)
  }

  componentWillUnmount () {
    if (this.state.chosenColor !== this.props.horse.get('color')) {
      const newColor = fromHsv(this.state.chosenColor)
      logDebug(newColor, 'newColor')
      this.props.dispatch(horseUpdated(this.props.horse.set('color', newColor)))
    }
  }

  changeColor (newColor) {
    this.setState({
      chosenColor: newColor
    })
  }

  render () {
    return (
      <View style={{flex: 1, width: '100%', height: '100%', padding: 20}}>
        <ColorPicker
          defaultColor={this.props.horse.get('color') || brand}
          onColorChange={this.changeColor}
          style={{flex: 1}}
        />
      </View>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    horse: pouchState.getIn(['horses', passedProps.horseID]),
  }
}

export default connect(mapStateToProps)(ColorPickerContainer)
