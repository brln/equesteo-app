import moment from 'moment'
import memoizeOne from 'memoize-one'
import { Agenda } from 'react-native-calendars';
import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { brand, routeLine } from '../../colors'
import { feed, groundwork, veterinary, ferrier} from '../../colors'
import { setCareEventDate } from '../../actions/standard'
import { NEW_MAIN_EVENT_MENU } from '../../screens/care'
import EqNavigation from '../../services/EqNavigation'
import DateTimePicker from "react-native-modal-datetime-picker";

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
