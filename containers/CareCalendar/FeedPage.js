import { Map, fromJS } from 'immutable'
import React, { Component } from 'react'
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import FeedRow from '../../components/CareCalendar/FeedRow'
import Button from '../../components/Button'
import { brand, darkBrand, darkGrey, lightGrey } from '../../colors'
import { setCareEventSpecificData } from "../../actions/standard"
import EqNavigation from '../../services/EqNavigation'
import { HORSE_PICKER } from '../../screens/consts/care'

class FeedEvent extends Component {
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

    this.changeNotes = this.changeNotes.bind(this)
    this.removeFeedRow = this.removeFeedRow.bind(this)
    this.addFeedRow = this.addFeedRow.bind(this)
    this.updateFeedRow = this.updateFeedRow.bind(this)

    if (!props.newCareEvent.getIn(['eventSpecificData', 'feedRows'])) {
      props.dispatch(setCareEventSpecificData(fromJS({
        feedRows: [
          {amount: 2, unit: 'flakes', feed: 'hay'}
        ]
      })))
    }

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'chooseHorses') {
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

  removeFeedRow (index) {
    return () => {
      const newESData = this.props.newCareEvent.get('eventSpecificData').removeIn(['feedRows', index])
      this.props.dispatch(setCareEventSpecificData(newESData))
    }
  }

  updateFeedRow (index, key) {
    return (value) => {
      const newESData = this.props.newCareEvent.get('eventSpecificData').setIn(['feedRows', index, key], value)
      this.props.dispatch(setCareEventSpecificData(newESData))
    }
  }

  addFeedRow () {
    let newESData = this.props.newCareEvent.get('eventSpecificData')
    const newFeedRows = newESData.get('feedRows').push(Map({amount: 2, unit: 'flakes', feed: 'hay'}))
    newESData = newESData.set('feedRows', newFeedRows)
    this.props.dispatch(setCareEventSpecificData(newESData))
  }

  changeNotes (newVal) {
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.get('eventSpecificData').set('notes', newVal)
    ))
  }

  render () {
    const feedRows = this.props.newCareEvent.getIn(['eventSpecificData', 'feedRows'])
    let displayRows
    if (feedRows) {
      displayRows = feedRows.map((row, i) => {
        return (
          <FeedRow
            key={i}
            amount={row.get('amount')}
            index={i}
            removeFeedRow={this.removeFeedRow}
            unit={row.get('unit')}
            updateFeedRow={this.updateFeedRow}
            feed={row.get('feed')}
          />
        )
      })
    }
    return (
      <ScrollView style={{flex: 1}}>
        <View style={{flex: 1, padding: 10, borderBottomWidth: 2, borderBottomColor: darkGrey, paddingBottom: 20}}>
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
        <View style={{flex: 2}}>
        { displayRows }
        </View>
        <Button
          text={'Add Row'}
          onPress={this.addFeedRow}
          color={brand}
        />
      </ScrollView>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
  }
}

export default  connect(mapStateToProps)(FeedEvent)
