import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'
import { BackHandler, Keyboard } from 'react-native'

import {
  userUpdated,
} from "../actions/standard"
import {
  persistUserUpdate,
  startNetworkTracking,
} from "../actions/functional"
import { brand } from '../colors'
import { logRender } from '../helpers'
import { EqNavigation } from '../services'
import UpdateProfile from '../components/UpdateProfile'

class UpdateProfileContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Edit My Account",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0,
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (!state.cachedUser && props.user) {
      return {
        cachedUser: props.user,
      }
    }
    return state
  }

  constructor (props) {
    super(props)
    this.state = {
      cachedUser: null,
      deletedPhotoIDs: [],
      doRevert: true,
      showPhotoMenu: false,
      selectedPhotoID: null
    }
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.clearPhotoMenu = this.clearPhotoMenu.bind(this)
    this.goBack = this.goBack.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.thisUsersPhotos = this.thisUsersPhotos.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.memoThisUsersPhotos = memoizeOne(this.thisUsersPhotos)
    this.openPhotoMenu = this.openPhotoMenu.bind(this)
    this.restartNetworkListener = this.restartNetworkListener.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    if (buttonId === 'save') {
      this.setState({
        doRevert: false
      })
      EqNavigation.pop(this.props.componentId).catch(() => {})
      this.props.dispatch(persistUserUpdate(this.props.user.get('_id'), this.state.deletedPhotoIDs, true))
    }
  }

  clearPhotoMenu () {
    this.setState({
      showPhotoMenu: false,
      selectedPhotoID: null
    })
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
            color: 'white'
          },
        ]
      }
    })
  }

  openPhotoMenu (profilePhotoID) {
    this.setState({
      showPhotoMenu: true,
      selectedPhotoID: profilePhotoID
    })
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [],
        leftButtons: [],
      }
    })
  }

  componentWillUnmount () {
    this.goBack()
  }

  goBack () {
    if (this.state.doRevert) {
      this.props.dispatch(userUpdated(this.state.cachedUser))
    }
  }

  componentDidAppear() {
    BackHandler.addEventListener('hardwareBackPress', this.goBack)
  }

  componentDidDisappear() {
    BackHandler.removeEventListener('hardwareBackPress', this.goBack)
  }

  changeAccountDetails (user) {
    this.props.dispatch(userUpdated(user))
  }

  restartNetworkListener() {
    this.props.dispatch(startNetworkTracking())
  }

  markPhotoDeleted (photoID) {
    if (photoID === this.props.user.get('profilePhotoID')) {
      let swapped = false
      const allPhotos = this.memoThisUsersPhotos(this.props.userPhotos, this.state.deletedPhotoIDs)
      for (let otherPhoto of allPhotos.valueSeq()) {
        const id = otherPhoto.get('_id')
        if (id !== photoID && this.state.deletedPhotoIDs.indexOf(id) < 0) {
          swapped = true
          this.props.dispatch(userUpdated(this.props.user.set('profilePhotoID', id)))
        }
      }
      if (!swapped) {
        this.props.dispatch(userUpdated(this.props.user.set('profilePhotoID', null)))
      }
    }
    this.setState({
      deletedPhotoIDs: [...this.state.deletedPhotoIDs, photoID]
    })
  }

  thisUsersPhotos (userPhotos, deletedPhotoIDs) {
    return userPhotos.filter((photo) => {
      return photo.get('deleted') !== true
        && photo.get('userID') === this.props.user.get('_id')
        && deletedPhotoIDs.indexOf(photo.get('_id')) < 0
    })
  }

  render() {
    logRender('UpdateProfileContainer')
    return (
      <UpdateProfile
        changeAccountDetails={this.changeAccountDetails}
        clearPhotoMenu={this.clearPhotoMenu}
        markPhotoDeleted={this.markPhotoDeleted}
        openPhotoMenu={this.openPhotoMenu}
        restartNetworkListener={this.restartNetworkListener}
        user={this.props.user}
        userPhotos={this.memoThisUsersPhotos(this.props.userPhotos, this.state.deletedPhotoIDs)}
        showPhotoMenu={this.state.showPhotoMenu}
        selectedPhotoID={this.state.selectedPhotoID}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const user = pouchState.get('users').get(localState.get('userID'))
  return {
    user,
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(UpdateProfileContainer)
