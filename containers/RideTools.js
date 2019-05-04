import memoizeOne from 'memoize-one'
import { List } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Dimensions,
  FlatList,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AtlasEntryModal from '../components/RideTools/AtlasEntryModal'
import { brand, darkGrey, lightGrey } from '../colors'
import { logRender } from '../helpers'
import {
  FOLLOW_LIST,
  SHARE_RIDE,
  UPDATE_RIDE
} from '../screens/main'
import DeleteModal from '../components/Shared/DeleteModal'
import { createRideAtlasEntry } from "../actions/functional"
import Thumbnail from '../components/Images/Thumbnail'
import {
  createRide,
  rideUpdated,
} from '../actions/standard'
import {
  persistRide,
} from '../actions/functional'
import { EqNavigation } from '../services'

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
      atlasEntryName: props.ride.get('name'),
      deleteModalOpen: false,
      atlasEntryModalOpen: false,
    }
    this.changeAtlasEntryName = this.changeAtlasEntryName.bind(this)
    this.closeAtlasEntryModal = this.closeAtlasEntryModal.bind(this)
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.createRideAtlasEntry = this.createRideAtlasEntry.bind(this)
    this.deleteRide = this.deleteRide.bind(this)
    this.duplicateRide = this.duplicateRide.bind(this)
    this.memoFollowings = memoizeOne(this.followings.bind(this))
    this.menuItems = this.menuItems.bind(this)
    this.shareRide = this.shareRide.bind(this)
    this.showAtlasEntryModal = this.showAtlasEntryModal.bind(this)
    this.showDeleteModal = this.showDeleteModal.bind(this)
    this.updateRide = this.updateRide.bind(this)
  }

  closeDeleteModal () {
    this.setState({
      deleteModalOpen: false
    })
  }

  createRideAtlasEntry () {
    return this.props.dispatch(createRideAtlasEntry(
      this.state.atlasEntryName,
      this.props.userID,
      this.props.ride,
      this.props.rideCoordinates,
      this.props.rideElevations,
    ))
  }

  deleteRide () {
    this.props.dispatch(rideUpdated(this.props.ride.set('deleted', true)))
    this.props.dispatch(persistRide(this.props.ride.get('_id'), false, [], [], null, List()))
    EqNavigation.popToRoot(this.props.componentId).catch(() => {})
  }

  showAtlasEntryModal () {
    // @TODO debounce
    this.setState({
      atlasEntryModalOpen: true
    })
  }

  showDeleteModal () {
    // @TODO debounce
    this.setState({
      deleteModalOpen: true
    })
  }

  updateRide () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: UPDATE_RIDE,
        passProps: {
          rideID: this.props.rideID,
          popBackTo: this.props.popBackTo
        },
      },
    }).catch(() => {})
  }

  shareRide () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: SHARE_RIDE,
        passProps: {
          rideID: this.props.rideID,
        }
      }
    }).catch(() => {})
  }

  duplicateRide () {
    const doDupe  = (userID) => {
      const rideID = `${userID.toString()}_${(new Date).getTime().toString()}`
      this.props.dispatch(createRide(
        rideID,
        userID,
        this.props.ride,
        this.props.rideElevations,
        this.props.rideCoordinates,
        this.props.ride.get('_id')
      ))
      return this.props.dispatch(persistRide(rideID, true, [], [], false, []))
    }


    EqNavigation.push(this.props.componentId, {
      component: {
        name: FOLLOW_LIST,
        passProps: {
          duplicateRide: doDupe,
          userIDs: this.memoFollowings(this.props.follows, this.props.userID),
          localCallbackName: 'duplicateRide',
        }
      }
    }).catch(() => {})
  }

  closeAtlasEntryModal () {
    this.setState({
      atlasEntryModalOpen: false
    })
  }

  changeAtlasEntryName (atlasEntryName) {
    this.setState({ atlasEntryName })
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


  menuItems () {
    let menuItems = [
      {
        name: 'Save to My Ride Atlas',
        icon: require('../img/rideTools/bookmark.png'),
        onPress: this.showAtlasEntryModal
      }
    ]
    if (this.props.userID === this.props.rideUserID) {
      menuItems = menuItems.concat([
        {
          name: 'Duplicate to Another User',
          icon: require('../img/rideTools/duplicate.png'),
          onPress: this.duplicateRide
        },
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
          name: 'Delete',
          icon: require('../img/rideTools/delete.png'),
          onPress: this.showDeleteModal
        }
      ])
    }
    return menuItems
  }


  render() {
    logRender('RideTools container')
    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <DeleteModal
          modalOpen={this.state.deleteModalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteFunc={this.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />
        <AtlasEntryModal
          modalOpen={this.state.atlasEntryModalOpen}
          closeModal={this.closeAtlasEntryModal}
          name={this.state.atlasEntryName}
          changeName={this.changeAtlasEntryName}
          createRideAtlasEntry={this.createRideAtlasEntry}
        />
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
    ride: pouchState.getIn(['rides', passedProps.rideID]),
    rideCoordinates: pouchState.get('selectedRideCoordinates'),
    rideElevations: pouchState.get('selectedRideElevations'),
    rideID: passedProps.rideID,
    rideUserID: passedProps.rideUserID,
    userID: localState.get('userID')
  }
}

export default  connect(mapStateToProps)(RideToolsContainer)
