import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { brand, darkGrey, lightGrey } from '../../colors'
import { logRender } from '../../helpers'
import Thumbnail from '../../components/Images/Thumbnail'
import functional from '../../actions/functional'
import EqNavigation from '../../services/EqNavigation'
import Amplitude, { DELETE_CARE_EVENT } from "../../services/Amplitude"

const { width } = Dimensions.get('window')

class EventToolsContainer extends Component {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.deleteCareEvent = this.deleteCareEvent.bind(this)
    this.menuItems = this.menuItems.bind(this)
  }

  deleteCareEvent () {
    Amplitude.logEvent(DELETE_CARE_EVENT)
    EqNavigation.popTo(this.props.popAfterDeleteCompID).then(() => {
      this.props.dispatch(functional.deleteCareEvent(this.props.careEvent))
    }).catch(() => {})
  }

  renderMenuItem ({ item }) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80, backgroundColor: brand}}
          onPress={item.onPress}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                emptySource={item.icon}
                empty={true}
                height={width / 7}
                width={width/ 7}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text style={{color: 'white', fontSize: 20}}>{item.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  confirmDelete () {
    Alert.alert(
      'Delete Care Event?',
      'Are you sure you want to delete this event? It will be gone forever and there is no undo.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: this.deleteCareEvent,
          style: 'destructive'
        },
      ],
      {cancelable: true},
    )
  }

  menuItems () {
    return [
      {
        name: 'Delete',
        icon: require('../../img/rideTools/delete.png'),
        onPress: this.confirmDelete
      }
    ]
  }


  render() {
    logRender('RideTools container')
    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <FlatList
          keyExtractor={i => i.name}
          containerStyle={{marginTop: 0}}
          data={this.menuItems()}
          renderItem={this.renderMenuItem}
          style={{height: '100%', borderTopWidth: 1, borderTopColor: darkGrey, backgroundColor: lightGrey}}
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
    careEvent: pouchState.getIn(['careEvents', passedProps.careEventID]),
    popAfterDeleteCompID: passedProps.popAfterDeleteCompID,
    userID: localState.get('userID'),
  }
}

export default  connect(mapStateToProps)(EventToolsContainer)
