import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { Component } from 'react'
import {
  Keyboard,
  View,
  Text,
  TextInput
} from 'react-native';
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import { brand, darkBrand, darkGrey, lightGrey } from '../../colors'
import { setCareEventSpecificData } from "../../actions/standard"
import EqNavigation from '../../services/EqNavigation'
import { HORSE_PICKER } from '../../screens/care'

class FarrierEvent extends Component {
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
      otherType: null
    }
    this.changeNotes = this.changeNotes.bind(this)
    this.renderTypeText = this.renderTypeText.bind(this)
    this.updateOtherType = this.updateOtherType.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.get('eventSpecificData')
        .set('otherType', this.state.otherType)
    ))
    if (buttonId === 'chooseHorses') {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: HORSE_PICKER,
          passProps: {
            popWhenDoneID: this.props.popWhenDoneID
          }
        }
      })
    }
  }

  updateOtherType (value) {
    this.setState({
      otherType: value
    })
  }

  changeNotes (newVal) {
    this.props.dispatch(setCareEventSpecificData(
      this.props.newCareEvent.get('eventSpecificData').set('notes', newVal)
    ))
  }

  renderTypeText () {
    return (
      <View style={{flex: 1}}>
        <Text style={{color: darkBrand }}>Type:</Text>
        <TextInput
          style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
          onChangeText={this.updateOtherType}
          underlineColorAndroid={'transparent'}
          maxLength={500}
          value={this.state.otherType}
        />
      </View>
    )
  }

  render () {
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
      >
        <View style={{flex: 1}}>
          <View style={{flex: 1, paddingLeft: 5, paddingRight: 5, paddingTop: 20}}>
            <View style={{flex: 1, paddingBottom: 20}}>
              { this.props.newCareEvent.get('secondaryEventType') === 'Other' ? this.renderTypeText() : null}
            </View>
            <View style={{flex: 1}}>
              <Text style={{color: darkBrand }}>Notes</Text>
              <TextInput
                multiline={true}
                style={{width: '100%', height: 150, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4, textAlignVertical: "top"}}
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

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
  }
}

export default  connect(mapStateToProps)(FarrierEvent)
