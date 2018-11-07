import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import { BackHandler, Keyboard } from 'react-native'

import {
  persistUser,
  persistUserPhoto,
  signOut,
  userUpdated,
  userPhotoUpdated
} from "../actions"
import { brand } from '../colors'
import { logRender } from '../helpers'
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
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
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
    }
    this.actuallyDeletePhotos = this.actuallyDeletePhotos.bind(this)
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.goBack = this.goBack.bind(this)
    this.signOut = this.signOut.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.thisUsersPhotos = this.thisUsersPhotos.bind(this)
    this.markPhotoDeleted = this.markPhotoDeleted.bind(this)
    this.memoThisUsersPhotos = memoizeOne(this.thisUsersPhotos)

    Navigation.events().bindComponent(this);
  }

  async navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    if (buttonId === 'save') {
      Navigation.pop(this.props.componentId)
      await this.props.dispatch(persistUser(this.props.user.get('_id')))
      this.actuallyDeletePhotos()
    } else if (buttonId === 'back') {
      this.goBack()
    }
  }

  async goBack () {
    this.props.dispatch(userUpdated(this.state.cachedUser))
    Navigation.pop(this.props.componentId)
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

  markPhotoDeleted (photoID) {
    if (photoID === this.props.user.get('profilePhotoID')) {
      const allPhotos = this.memoThisUsersPhotos(this.props.userPhotos, this.state.deletedPhotoIDs)
      for (let otherPhoto of allPhotos.valueSeq()) {
        const id = otherPhoto.get('_id')
        if (id !== photoID && this.state.deletedPhotoIDs.indexOf(id) < 0) {
          this.props.dispatch(userUpdated(this.props.user.set('profilePhotoID', id)))
        }
      }
    }
    this.setState({
      deletedPhotoIDs: [...this.state.deletedPhotoIDs, photoID]
    })
  }

  actuallyDeletePhotos () {
    for (let photoID of this.state.deletedPhotoIDs) {
      const deleted = this.props.userPhotos.get(photoID).set('deleted', true)
      this.props.dispatch(userPhotoUpdated(deleted))
      this.props.dispatch(persistUserPhoto(deleted.get('_id')))
    }
  }

  signOut () {
    this.props.dispatch(signOut())
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
        markPhotoDeleted={this.markPhotoDeleted}
        user={this.props.user}
        userPhotos={this.memoThisUsersPhotos(this.props.userPhotos, this.state.deletedPhotoIDs)}
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
