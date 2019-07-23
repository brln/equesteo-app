import { Map, fromJS } from 'immutable'
import React, { Component } from 'react'
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import EqPicker from '../../components/EqPicker'

import { brand, green, danger, darkBrand, darkGrey, lightGrey } from '../../colors'
import { elapsedTime, timeToString, unixTimeNow } from '../../helpers'
import EqNavigation from '../../services/EqNavigation'
import { HORSE_PICKER } from '../../screens/consts/care'
import Button from "../../components/Button"
import {setCareEventSpecificData} from "../../actions/standard"

const { height, width } = Dimensions.get('window')

class GroundworkPage extends Component {
  static options() {
    return {
      topBar: {
        title: {
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
        rightButtons: [
          {
            id: 'chooseHorses',
            text: 'Choose Horses',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      otherType: null,
      counterNumber: 0,
      elapsedTime: null,
      editMode: false,
      editValues: {
        hours: null,
        minutes: null,
        seconds: null,
      },
    }

    this.changeNotes = this.changeNotes.bind(this)
    this.decrementCounter = this.decrementCounter.bind(this)
    this.incrementCounter = this.incrementCounter.bind(this)
    this.recalcTime = this.recalcTime.bind(this)
    this.renderTimer = this.renderTimer.bind(this)
    this.resetTimer = this.resetTimer.bind(this)
    this.renderTypeText = this.renderTypeText.bind(this)
    this.runTimer = this.runTimer.bind(this)
    this.showEditing = this.showEditing.bind(this)
    this.showTime = this.showTime.bind(this)
    this.startEditing = this.startEditing.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
    this.unStopTimer = this.unStopTimer.bind(this)
    this.updateOtherType = this.updateOtherType.bind(this)
    this.updateTime = this.updateTime.bind(this)

    Navigation.events().bindComponent(this);
  }

  componentDidMount () {
    const startTime = this.props.newCareEvent.getIn(['eventSpecificData', 'startTime'])
    if (startTime) {
      this.runTimer()
    }
  }

  componentWillUnmount () {
    this.timerInterval = clearInterval(this.timerInterval)
  }

  recalcTime () {
    const startTime = this.props.newCareEvent.getIn(['eventSpecificData', 'startTime'])
    const lastPauseStart = this.props.newCareEvent.getIn(['eventSpecificData', 'lastPauseStart'])
    const pausedTime = this.props.newCareEvent.getIn(['eventSpecificData', 'pausedTime']) || 0
    const now = new Date()
    const nowElapsed = elapsedTime(startTime, now, pausedTime, lastPauseStart)
    this.setState({
      elapsedTime: nowElapsed,
    })
  }

  runTimer () {
    if (!this.timerInterval) {
      this.recalcTime()
      this.timerInterval = setInterval(() => {
        this.recalcTime()
      }, 100)
    }
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'chooseHorses') {
      this.timerInterval = clearInterval(this.timerInterval)
      this.props.dispatch(setCareEventSpecificData(
        this.props.newCareEvent.get('eventSpecificData')
          .set('elapsedTime', this.state.elapsedTime)
          .set('counterNumber', this.state.counterNumber)
          .set('otherType', this.state.otherType)
      ))
      Keyboard.dismiss()
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: HORSE_PICKER,
          passProps: {
            popWhenDoneID: this.props.popWhenDoneID
          }
        }
      }).catch(() => {})
    }
  }

  startTimer () {
    this.props.dispatch(setCareEventSpecificData(this.props.newCareEvent.get('eventSpecificData').set('startTime', unixTimeNow())))
    this.runTimer()
  }

  unStopTimer () {
    const lastPauseStart = this.props.newCareEvent.getIn(['eventSpecificData', 'lastPauseStart'])
    const oldPausedTime = this.props.newCareEvent.getIn(['eventSpecificData', 'pausedTime']) || 0
    const elapsed = (unixTimeNow() / 1000) - (lastPauseStart / 1000)
    const newPausedTime = oldPausedTime + elapsed
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.get('eventSpecificData').set('lastPauseStart', null).set('pausedTime', newPausedTime)
    ))
  }

  resetTimer () {
    this.timerInterval = clearInterval(this.timerInterval)
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.set('eventSpecificData', Map())
    ))
    this.setState({
      elapsedTime: null
    })
  }

  stopTimer () {
    this.props.dispatch(setCareEventSpecificData(this.props.newCareEvent.get('eventSpecificData').set('lastPauseStart', unixTimeNow())))
  }

  startEditing () {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: []
      }
    })
    const lastPauseStart = this.props.newCareEvent.getIn(['eventSpecificData', 'lastPauseStart'])
    if (this.props.newCareEvent.getIn(['eventSpecificData', 'startTime']) && !lastPauseStart) {
      this.stopTimer()
    }

    const { hours, minutes, seconds } = this.elapsedBreakdown(this.state.elapsedTime)

    this.setState({
      editMode: true,
      editValues: {
        hours: hours.toString(),
        minutes: minutes.toString(),
        seconds: seconds.toString(),
      }
    })
  }

  stopEditing () {
    const newHours = parseInt(this.state.editValues.hours)
    const newMinutes = parseInt(this.state.editValues.minutes)
    const newSeconds = parseInt(this.state.editValues.seconds)
    const newElapsed = (newHours * 3600) + (newMinutes * 60) + newSeconds

    const oldElapsed = this.state.elapsedTime || 0
    const oldStartTime = this.props.newCareEvent.getIn(['eventSpecificData', 'startTime']) || unixTimeNow()
    const diff = (oldElapsed - newElapsed) * 1000
    const newStartTime = oldStartTime + diff

    const newLastPause = this.props.newCareEvent.getIn(['eventSpecificData', 'lastPauseStart']) || unixTimeNow()
    this.props.dispatch(
      setCareEventSpecificData(
        this.props.newCareEvent.get('eventSpecificData').set('startTime', newStartTime).set('lastPauseStart', newLastPause)
      )
    )
    this.setState({
      editMode: false,
    }, this.runTimer)
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [
          {
            id: 'chooseHorses',
            text: 'Choose Horses',
            color: 'white'
          },
        ]
      }
    })
  }


  showTime () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 45}}>{timeToString(this.state.elapsedTime || 0)}</Text>
      </View>
    )
  }

  elapsedBreakdown (elapsedTime) {
    const hours = elapsedTime / 3600
    const justHours = Math.floor(hours)
    const minutes = (hours - justHours) * 60
    const justMinutes = Math.round(Math.floor(minutes))
    const seconds = Math.round((minutes - justMinutes) * 60 )
    return {
      hours: justHours,
      minutes: justMinutes,
      seconds,
    }
  }

  updateTime (unit) {
    return (value) => {
      const newValues = { ...this.state.editValues }
      newValues[unit] = value
      this.setState({
        editValues: newValues
      })
    }
  }

  showEditing () {
    const hours = [
      {label: '0', value: '0'},
      {label: '1', value: '1'},
      {label: '2', value: '2'},
      {label: '3', value: '3'}
    ]
    const minutesSeconds = []
    for (let i = 0; i < 60; i++) {
      minutesSeconds.push({label: i.toString(), value: i.toString()})
    }
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 3, justifyContent: 'center', alignItems: 'center', paddingLeft: 5}}>
            <View style={{width: '100%'}}>
              <Text style={{color: darkBrand }}>Hours</Text>
              <EqPicker
                value={this.state.editValues.hours}
                items={hours}
                onValueChange={this.updateTime('hours')}
              />
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 30}}>:</Text>
          </View>
          <View style={{flex: 3, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{width: '100%'}}>
              <Text style={{color: darkBrand }}>Mins:</Text>
              <EqPicker
                value={this.state.editValues.minutes}
                items={minutesSeconds}
                onValueChange={this.updateTime('minutes')}
              />
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 30}}>:</Text>
          </View>
          <View style={{flex: 3, justifyContent: 'center', alignItems: 'center', paddingRight: 5}}>
            <View style={{width: '100%'}}>
              <Text style={{color: darkBrand }}>Secs:</Text>
              <EqPicker
                value={this.state.editValues.seconds}
                items={minutesSeconds}
                onValueChange={this.updateTime('seconds')}
              />
            </View>
          </View>
        </View>
      </View>
    )
  }

  changeNotes (newVal) {
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.get('eventSpecificData').set('notes', newVal)
    ))
  }

  incrementCounter () {
    this.setState({
      counterNumber: this.state.counterNumber + 1
    })
  }

  decrementCounter () {
    this.setState({
      counterNumber: this.state.counterNumber - 1
    })
  }

  updateOtherType (value) {
    this.setState({
      otherType: value
    })
  }

  renderCounter () {
    return (
      <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
            <Button color={brand} onPress={this.decrementCounter} text={'-'}/>
          </View>

          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 50}}>{this.state.counterNumber}</Text>
          </View>

          <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center'}}>
            <Button color={brand} onPress={this.incrementCounter} text={'+'}/>
          </View>

        </View>
      </View>
    )
  }

  renderTimer () {
    const buttonWidth = 3.7
    const started = this.props.newCareEvent.getIn(['eventSpecificData', 'startTime'])
    const lastPauseStart = this.props.newCareEvent.getIn(['eventSpecificData', 'lastPauseStart'])
    let timerButton
    let resetButton

    if (!this.state.editMode) {
      resetButton = (
        <View style={{padding: 10}}>
          <Button width={width / buttonWidth} color={brand} onPress={this.resetTimer} text='Reset'/>
        </View>
      )
      if (!lastPauseStart) {
        resetButton = (
          <View style={{padding: 10}}>
            <Button width={width / buttonWidth} disabled={true} color={brand} onPress={() => {}} text='Reset'/>
          </View>
        )
      }

      timerButton = (
        <View style={{padding: 10}}>
          <Button width={width / buttonWidth} color={green} onPress={this.state.elapsedTime ? this.unStopTimer : this.startTimer} text='Start'/>
        </View>
      )
      if (started && !lastPauseStart) {
        timerButton = (
          <View style={{padding: 10}}>
            <Button width={width / buttonWidth} color={danger} onPress={this.stopTimer} text='Stop'/>
          </View>
        )
      }
    }

    let editButton = (
      <View style={{padding: 10}}>
        <Button width={width / buttonWidth} color={brand} onPress={this.startEditing} text='Edit'/>
      </View>
    )
    if (this.state.editMode) {
      editButton = (
        <View style={{padding: 10}}>
          <Button width={width / buttonWidth} color={brand} onPress={this.stopEditing} text='Done'/>
        </View>
      )
    }

    return (
      <View style={{flex: 2}}>
        { this.state.editMode ? this.showEditing() : this.showTime()}
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flex: 1, flexDirection: 'row', borderColor: 'blue'}}>
            { editButton }
            { resetButton }
            { timerButton }
          </View>
        </View>
      </View>
    )
  }

  renderTypeText () {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={{flex: 1, width: '80%'}}>
          <Text style={{color: darkBrand }}>Type:</Text>
          <TextInput
            style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
            onChangeText={this.updateOtherType}
            underlineColorAndroid={'transparent'}
            maxLength={500}
            value={this.state.otherType}
          />
        </View>
      </View>
    )
  }

  render () {
    return (
      <KeyboardAwareScrollView>
        <View style={{height: height - 56}}>
          <View style={{flex: 2}}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.nameText}>{this.props.newCareEvent.get('secondaryEventType')}</Text>
            </View>
            { this.props.newCareEvent.get('secondaryEventType') === 'Other' ? this.renderTypeText() : null}
            { this.props.pageType === 'timer' ? this.renderTimer() : this.renderCounter() }
          </View>
          <View style={{flex: 1}}>
            <View style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
              <Text style={{color: darkBrand }}>Notes</Text>
              <TextInput
                multiline={true}
                style={{width: '100%', height: 150, padding: 10, borderColor: darkBrand, borderWidth: 1, textAlignVertical: "top", borderRadius: 4 }}
                underlineColorAndroid={'transparent'}
                onChangeText={this.changeNotes}
                value={this.props.newCareEvent.getIn(['eventSpecificData', 'notes'])}
                maxLength={2000}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

const styles = StyleSheet.create({
  nameText: {
    fontSize: 50,
    fontFamily: 'Montserrat-Regular',
    textShadowColor: 'black',
    textShadowRadius: 3,
    textShadowOffset: {width: 2, height: 1},
    textAlign: 'center',
  }
});

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
  }
}

export default  connect(mapStateToProps)(GroundworkPage)
