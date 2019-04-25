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
    this.memoMarkedDates = memoizeOne(this.markedDates)
  }

  selectDate (day) {
    const markedDates = this.memoMarkedDates(
      this.props.careEvents,
      this.props.horseUsers,
      this.props.horseCareEvents,
      this.props.userID
    )
    const marked = markedDates[day.dateString]
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
        const title = moment(day.dateString, 'YYYY-MM-DD').format('MMM Do')
        EqNavigation.push(this.props.activeComponent, {
          component: {
            name: DAY,
            options: {
              topBar: {
                title: {
                  text: title,
                  color: 'white',
                  fontSize: 20
                },
              }
            },
            passProps: {
              day: day.dateString,
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

  markedDates (careEvents, horseUsers, horseCareEvents, userID) {
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

    // Get all the users horses
    const horseIDs = horseUsers.valueSeq().filter((hu) => {
      return hu.get('userID') === userID && hu.get('deleted') !== true
    }).map((hu) => {
      return hu.get('horseID')
    })

    // Get all the care events for those horses
    const hces = horseCareEvents.valueSeq().filter(hce => {
      return horseIDs.indexOf(hce.get('horseID')) >= 0
    })

    const allDots = {}
    const foundIDs = {}
    for (let horseCareEvent of hces.valueSeq()) {
      const careEvent = careEvents.get(horseCareEvent.get('careEventID'))
      foundIDs[careEvent.get('_id')] = true
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

    for (let careEvent of careEvents.valueSeq()) {
      const careEventID = careEvent._id
      if (careEvent.get('userID') === userID && careEvent.get('deleted') !== true && !foundIDs[careEventID]) {
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
    const justTime = (moment(time).hours() * 3600) + (moment(time).minutes() * 60) + moment(time).seconds()
    const dateTime = moment(this.state.chosenDay)
    dateTime.add(justTime, 'seconds')
    dateTime.add((new Date()).getTimezoneOffset(), 'minutes')
    this.props.dispatch(setCareEventDate(dateTime.valueOf()))

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
          markedDates={this.memoMarkedDates(
            this.props.careEvents,
            this.props.horseUsers,
            this.props.horseCareEvents,
            this.props.userID
          )}
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
    horseCareEvents: pouchState.get('horseCareEvents'),
    horseUsers: pouchState.get('horseUsers'),
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
    startedHere: passedProps.startedHere,
    showDay: passedProps.showDay,
    userID: localState.get('userID')
  }
}

export default  connect(mapStateToProps)(Calendar)
