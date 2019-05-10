import memoizeOne from 'memoize-one'
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
import { brand, darkGrey, lightGrey } from '../colors'
import { logRender } from '../helpers'
import Thumbnail from '../components/Images/Thumbnail'
import { FOLLOW_LIST, UPDATE_HORSE } from '../screens/main'
import { EqNavigation } from '../services'
import {
  changeHorseOwner,
  deleteHorseUser,
  persistHorseUser,
} from '../actions/functional'

const { width } = Dimensions.get('window')

class HorseToolsContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "Horse Tools",
          color: 'white',
          fontSize: 20
        },
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
    this.memoFollowings = memoizeOne(this.followings.bind(this))
    this.confirmDelete = this.confirmDelete.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.transferHorse = this.transferHorse.bind(this)
    this.updateHorse = this.updateHorse.bind(this)
  }

  deleteHorse () {
    const horseUser = this.props.horseUser
    this.props.dispatch(deleteHorseUser(horseUser.get('_id')))
    this.props.dispatch(persistHorseUser(horseUser.get('_id')))
    EqNavigation.popTo(this.props.popBackTo).catch(() => {})
  }

  updateHorse () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: UPDATE_HORSE,
        title: "Update Horse",
        passProps: {
          horseID: this.props.horse.get('_id'),
          horseUserID: this.props.horseUser.get('_id'),
          newHorse: false
        },
      }
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

  followings (follows, userID) {
    return follows.filter(f =>
      !f.get('deleted') && f.get('followerID') === userID
    ).valueSeq().map(f => {
      return f.get('followingID')
    }).toJS()
  }

  transferHorse () {
    const doTransfer  = (userID) => {
      this.props.dispatch(changeHorseOwner(this.props.horse, userID))
    }

    EqNavigation.push(this.props.componentId, {
      component: {
        name: FOLLOW_LIST,
        passProps: {
          doTransfer,
          userIDs: this.memoFollowings(this.props.follows, this.props.userID),
          localCallbackName: 'transferHorse',
        }
      }
    }).catch(() => {})
  }

  confirmDelete () {
    Alert.alert(
      'Archive Horse?',
      'Are you sure you want to archive this horse? It won\'t appear in your barn or be selectable for new rides, but will remain on your old training records.',
      [
        {
          text: 'OK',
          onPress: this.deleteHorse
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    )
  }

  menuItems () {
    let menuItems = [
      {
        name: 'Edit',
        icon: require('../img/rideTools/edit.png'),
        onPress: this.updateHorse
      },
      {
        name: 'Archive',
        icon: require('../img/rideTools/delete.png'),
        onPress: this.confirmDelete
      },
      {
        name: 'Transfer to Another User',
        icon: require('../img/rideTools/duplicate.png'),
        onPress: this.transferHorse,
      },
    ]
    return menuItems
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
    follows: pouchState.get('follows'),
    popBackTo: passedProps.popBackTo,
    horse: pouchState.getIn(['horses', passedProps.horseID]),
    horseUser: pouchState.getIn(['horseUsers', passedProps.horseUserID]),
    userID: localState.get('userID')
  }
}

export default  connect(mapStateToProps)(HorseToolsContainer)
