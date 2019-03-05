import { List } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { brand, darkGrey, lightGrey } from '../colors'
import { logRender } from '../helpers'
import { BARN, FEEDBACK, FIND_PEOPLE, SHARE_RIDE, UPDATE_RIDE } from '../screens'
import DeleteModal from '../components/Shared/DeleteModal'
import Thumbnail from '../components/Images/Thumbnail'
import {
  rideUpdated,
} from '../actions/standard'
import {
  persistRide,
} from '../actions/functional'

const { width } = Dimensions.get('window')

class RideToolsContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "Ride Tools",
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
    this.state = {
      deleteModalOpen: false,
    }
    this.deleteRide = this.deleteRide.bind(this)
    this.shareRide = this.shareRide.bind(this)
    this.showBarn = this.showBarn.bind(this)
    this.showDeleteModal = this.showDeleteModal.bind(this)
    this.showFindFriends = this.showFindFriends.bind(this)
    this.updateRide = this.updateRide.bind(this)
  }

  closeDeleteModal () {
    this.setState({
      deleteModalOpen: false
    })
  }

  deleteRide () {
    this.props.dispatch(rideUpdated(this.props.ride.set('deleted', true)))
    this.props.dispatch(persistRide(this.props.ride.get('_id'), false, [], [], null, List()))
    Navigation.popToRoot(this.props.componentId)
  }

  showDeleteModal () {
    this.setState({
      deleteModalOpen: true
    })
  }

  showBarn () {
    Navigation.push(this.props.activeComponent, {
      component: {
        name: BARN,
      }
    })
  }

  showFindFriends() {
    Navigation.push(this.props.activeComponent, {
      component: {
        name: FIND_PEOPLE,
        title: 'Find Friends',
      }
    })
  }

  updateRide () {
    Navigation.push(this.props.componentId, {
      component: {
        name: UPDATE_RIDE,
        passProps: {
          rideID: this.props.rideID,
          popBackTo: this.props.popBackTo
        },
      },
    })
  }

  shareRide () {
    Navigation.push(this.props.componentId, {
      component: {
        name: SHARE_RIDE,
        passProps: {
          rideID: this.props.rideID,
        }
      }
    })
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

  render() {
    logRender('RideTools container')
    const menuItems = [
      {
        name: 'Share',
        icon: require('../img/rideTools/share.png'),
        onPress: this.shareRide
      },
      {
        name: 'Edit',
        icon: require('../img/rideTools/edit.png'),
        onPress: this.updateRide
      },
      {
        name: 'Save to My Rides',
        icon: require('../img/rideTools/bookmark.png'),
        onPress: () => {}
      },
      {
        name: 'Delete',
        icon: require('../img/rideTools/delete.png'),
        onPress: this.showDeleteModal
      }
    ]

    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <DeleteModal
          modalOpen={this.state.deleteModalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteFunc={this.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />
        <FlatList
          keyExtractor={i => i.name}
          containerStyle={{marginTop: 0}}
          data={menuItems}
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
    ride: pouchState.getIn(['rides', passedProps.rideID]),
    rideID: passedProps.rideID
  }
}

export default  connect(mapStateToProps)(RideToolsContainer)
