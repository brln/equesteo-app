import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { brand } from '../../colors'

class TimePickerContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "Pick Date",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Text>Time Picker</Text>
      </View>
    )

  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    careEvents: pouchState.get('careEvents'),
    popWhenDoneID: passedProps.popWhenDoneID,
    selectedDate: passedProps.selected,
    startedHere: passedProps.startedHere
  }
}

export default connect(mapStateToProps)(TimePickerContainer)
