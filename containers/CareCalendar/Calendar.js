import moment from 'moment'
import memoizeOne from 'memoize-one'
import { CalendarList } from 'react-native-calendars';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'

import { brand, routeLine } from '../../colors'
import { feed, groundwork, veterinary, ferrier} from '../../colors'
import { setCareEventDate } from '../../actions/standard'
import { CARE_EVENT, DAY, NEW_MAIN_EVENT_MENU } from '../../screens/care'
import EqNavigation from '../../services/EqNavigation'
import DateTimePicker from "react-native-modal-datetime-picker"

class Calendar extends Component {
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
    this.state = {
      timePickerVisible: false,
      chosenDay: null
    }
    this.closeTimePicker = this.closeTimePicker.bind(this)
    this.openTimePicker = this.openTimePicker.bind(this)
    this.selectDate = this.selectDate.bind(this)
    this.setTime = this.setTime.bind(this)
    this.memoMarkedDates = memoizeOne(this.markedDates.bind(this))
  }

  selectDate (day) {
    const marked = this.memoMarkedDates(this.props.careEvents)[day.dateString]
    if (this.props.showDay && marked && marked.careEvents.length > 0) {
      if (marked.careEvents.length === 1) {
        EqNavigation.push(this.props.activeComponent, {
          component: {
            name: CARE_EVENT,
            passProps: {
              careEventID: marked.careEvents[0]
            }
          },
        })
      } else if (marked.careEvents.length > 1) {
        EqNavigation.push(this.props.activeComponent, {
          component: {
            name: DAY,
            passProps: {
              day: moment(day.timestamp).format('YYYY-MM-DD'),
            }
          },
        })
      }
    } else {
      this.setState({
        timePickerVisible: true,
        chosenDay: moment(day.timestamp)
      })
    }
  }

  markedDates (careEvents) {
    const ferrierDot = {key:'ferrier', color: ferrier}
    const groundworkDot = {key:'groundwork', color: groundwork}
    const veterinaryDot = {key:'veterinary', color: veterinary}
    const feedDot = {key:'feed', color: feed}
    const dotMap = {
      'Feed': feedDot ,
      'Veterinary': veterinaryDot,
      'Groundwork': groundworkDot,
      'Farrier': ferrierDot,
    }

    const allDots = {}
    for (let careEvent of careEvents.valueSeq()) {
      if (careEvent.get('deleted') !== true) {
        const dateKey = moment(careEvent.get('date')).format('YYYY-MM-DD')
        if (!allDots[dateKey]) {
          allDots[dateKey] = {dots: [], careEvents: []}
        }
        allDots[dateKey].careEvents = [...allDots[dateKey].careEvents, careEvent.get('_id')]
        const dotObj = dotMap[careEvent.get('mainEventType')]
        if (dotObj && allDots[dateKey].dots.indexOf(dotObj) < 0) {
          allDots[dateKey].dots.push(dotObj)
        }
      }
    }
    return allDots
  }

  openTimePicker () {
    this.setState({
      timePickerVisible: true
    })
  }

  closeTimePicker () {
    this.setState({
      timePickerVisible: false
    })
  }

  setTime (time) {
    this.closeTimePicker()
    const timestamp = moment(time).format('x')
    const justTime = timestamp - moment(time).startOf('day')
    const dateTime = this.state.chosenDay.add(justTime / 1000, 'seconds')
    this.props.dispatch(setCareEventDate(dateTime))

    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: NEW_MAIN_EVENT_MENU,
        passProps: {
          popWhenDoneID: this.props.popWhenDoneID
        }
      },
    })
  }


  render() {
    return (
      <View>
        <DateTimePicker
          isVisible={this.state.timePickerVisible}
          onConfirm={this.setTime}
          onCancel={this.closeTimePicker}
          mode={"time"}
          is24Hour={false}
        />
        <CalendarList
          firstDay={1}
          markedDates={this.memoMarkedDates(this.props.careEvents)}
          onDayPress={this.selectDate}
          theme={{
            todayTextColor: routeLine
          }}
          markingType={'multi-dot'}
        />
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
    newCareEvent: localState.get('newCareEvent'),
    startedHere: passedProps.startedHere,
    showDay: passedProps.showDay
  }
}

export default  connect(mapStateToProps)(Calendar)
