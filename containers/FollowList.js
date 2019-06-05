import memoizeOne from 'memoize-one'
import { List } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import { userName } from '../modelHelpers/user'
import { logRender } from '../helpers'
import FollowList from '../components/FollowList/FollowList'
import { EqNavigation } from '../services'

class FollowListContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        title: {
          color: 'white',
        }
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      duplicationInProgress: false,
      duplicateModalOpen: false,
      transferModalOpen: false,
      transferUserID: null,
    }

    this.closeDuplicateModal = this.closeDuplicateModal.bind(this)
    this.closeTransferModal = this.closeTransferModal.bind(this)
    this.doTransfer = this.doTransfer.bind(this)
    this.duplicateRide = this.duplicateRide.bind(this)
    this.memoUsers = memoizeOne(this.users.bind(this))
    this.openTransferModal = this.openTransferModal.bind(this)
    this.openDuplicateModal = this.openDuplicateModal.bind(this)
  }

  openDuplicateModal (transferUser) {
    this.setState({
      duplicateModalOpen: true,
      transferUserID: transferUser.get('_id'),
    })
  }

  openTransferModal (transferUser) {
    this.setState({
      transferModalOpen: true,
      transferUserID: transferUser.get('_id'),
    })
  }

  closeDuplicateModal () {
    this.setState({
      duplicateModalOpen: false
    })
  }

  closeTransferModal () {
    this.setState({
      transferModalOpen: false
    })
  }

  users (allUsers, userIDs) {
    return List(userIDs.map(userID => allUsers.get(userID)).filter(u => u)).sort((a, b) => {
      const aName = userName(a).toLowerCase()
      const bName = userName(b).toLowerCase()
      if (aName < bName) { return -1 }
      if (aName > bName) { return 1 }
    })
  }

  localCallback (localCallbackName) {
    if (localCallbackName === 'duplicateRide') {
      return (user) => {
        return () => {
          return this.openDuplicateModal(user)
        }
      }
    } else if (localCallbackName === 'transferHorse') {
      return (user) => {
        return () => {
          return this.openTransferModal(user)
        }
      }
    }
  }

  duplicateRide () {
    this.setState({
      duplicationInProgress: true
    })
    this.props.duplicateRide(this.state.transferUserID).then(() => {
      EqNavigation.popToRoot(this.props.componentId).catch(() => {})
    }).catch(() => {
      EqNavigation.popToRoot(this.props.componentId).catch(() => {})
    })

  }

  doTransfer () {
    this.props.doTransfer(this.state.transferUserID)
    EqNavigation.popToRoot(this.props.componentId)
  }

  render() {
    logRender('FollowListContainer')
    return (
      <FollowList
        closeDuplicateModal={this.closeDuplicateModal}
        closeTransferModal={this.closeTransferModal}
        duplicationInProgress={this.state.duplicationInProgress}
        duplicateModalOpen={this.state.duplicateModalOpen}
        duplicateModalYes={this.duplicateRide}
        transferModalYes={this.doTransfer}
        onPress={this.props.onPress || this.localCallback(this.props.localCallbackName)}
        transferModalOpen={this.state.transferModalOpen}
        users={this.memoUsers(this.props.users, this.props.userIDs)}
        userPhotos={this.props.userPhotos}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const userIDs = passedProps.userIDs
  const pouchState = state.get('pouchRecords')
  return {
    doTransfer: passedProps.doTransfer,
    duplicateRide: passedProps.duplicateRide,
    localCallbackName: passedProps.localCallbackName,
    onPress: passedProps.onPress,
    userIDs,
    users: pouchState.get('users'),
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(FollowListContainer)
