import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { brand, darkGrey, lightGrey } from '../../colors'
import { logRender } from '../../helpers'
import DeleteModal from '../../components/Shared/DeleteModal'
import Thumbnail from '../../components/Images/Thumbnail'
import { deleteCareEvent } from '../../actions/functional'
import EqNavigation from '../../services/EqNavigation'

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
    this.state = {
      deleteModalOpen: false,
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteCareEvent = this.deleteCareEvent.bind(this)
    this.menuItems = this.menuItems.bind(this)
    this.showDeleteModal = this.showDeleteModal.bind(this)
  }

  closeDeleteModal () {
    this.setState({
      deleteModalOpen: false
    })
  }

  deleteCareEvent () {
    this.closeDeleteModal()
    EqNavigation.popTo(this.props.popAfterDeleteCompID).then(() => {
      this.props.dispatch(deleteCareEvent(this.props.careEvent))
    }).catch(() => {})
  }

  showDeleteModal () {
    this.setState({
      deleteModalOpen: true
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

  menuItems () {
    return [
      {
        name: 'Delete',
        icon: require('../../img/rideTools/delete.png'),
        onPress: this.showDeleteModal
      }
    ]
  }


  render() {
    logRender('RideTools container')
    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <DeleteModal
          modalOpen={this.state.deleteModalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteFunc={this.deleteCareEvent}
          text={"Are you sure you want to delete this care event?"}
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
    careEvent: pouchState.getIn(['careEvents', passedProps.careEventID]),
    popAfterDeleteCompID: passedProps.popAfterDeleteCompID,
    userID: localState.get('userID'),
  }
}

export default  connect(mapStateToProps)(EventToolsContainer)
