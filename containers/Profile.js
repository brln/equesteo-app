import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import BackgroundComponent from '../components/BackgroundComponent'
import Profile from '../components/Profile/Profile'
import {
  clearSearch,
  createFollow,
  deleteFollow ,
  signOut,
  uploadProfilePhoto,
} from "../actions"
import { brand } from '../colors'
import {
  ABOUT_PAGE,
  FOLLOW_LIST,
  HORSE_PROFILE,
  PHOTO_LIGHTBOX,
  UPDATE_PROFILE
} from '../screens'
import { logRender } from '../helpers'

class ProfileContainer extends BackgroundComponent {
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
          fontSize: 20
        }
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.closeLightbox = this.closeLightbox.bind(this)
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
    this.followings = this.followings.bind(this)
    this.followers = this.followers.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.profileUserHorses = this.profileUserHorses.bind(this)
    this.showAboutPage = this.showAboutPage.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showUserList = this.showUserList.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)

    Navigation.events().bindComponent(this);

    if (props.userID === props.profileUser.get('_id')) {
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'edit',
              text: 'Edit',
              color: 'white'
            },
            {
              id: 'logout',
              text: 'Log Out',
              color: 'white'
            }
          ]
        }
      })
    }
  }

  showPhotoLightbox (sources) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources,
          close: this.closeLightbox
        }
      }
    })
  }

  showAboutPage () {
    Navigation.push(this.props.componentId, {
      component: {
        name: ABOUT_PAGE,
      }
    })
  }

  closeLightbox () {
    Navigation.pop(this.props.componentId)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'edit') {
      Navigation.push(this.props.componentId, {
        component: {
          name: UPDATE_PROFILE,
          screen: UPDATE_PROFILE,
          title: 'Update Profile',
        }
      });
    } else if (buttonId === 'logout') {
      this.props.dispatch(signOut())
    }
  }

  createFollow (followingID) {
    this.props.dispatch(createFollow(followingID))
    this.props.dispatch(clearSearch())
  }

  deleteFollow (followingID) {
    this.props.dispatch(deleteFollow(followingID))
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  showUserList (followRecords, followingOrFollower) {
    const userIDs = followRecords.valueSeq().map((f) => f.get(followingOrFollower))
    Navigation.push(this.props.componentId, {
      component: {
        name: FOLLOW_LIST,
        passProps: {
          userIDs: userIDs.toJS(),
        }
      }
    })
  }

  showHorseProfile (horse) {
    Navigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {horse},
      }
    })
  }

  profileUserHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.profileUser.get('_id')) && hu.get('owner') === true && hu.get('deleted') !== true
    }).map((hu) => {
      if (!this.props.horses.get(hu.get('horseID'))) {
        throw Error('Don\'t have a horse that should be here.')
      }
      return this.props.horses.get(hu.get('horseID'))
    }).toList()
  }

  followings () {
    return this.props.follows.filter(
      f => !f.get('deleted') && f.get('followerID') === this.props.profileUser.get('_id')
    )
  }

  followers () {
    return this.props.follows.filter(
      f => !f.get('deleted') && f.get('followingID') === this.props.profileUser.get('_id')
    )
  }

  horseOwnerIDs () {
    return this.props.horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  render() {
    logRender('ProfileContainer')
    if (this.props.profileUser.get('_id')) {
      return (
        <Profile
          createFollow={this.createFollow}
          deleteFollow={this.deleteFollow}
          followings={this.followings()}
          followers={this.followers()}
          horseOwnerIDs={this.horseOwnerIDs()}
          horses={this.profileUserHorses()}
          profileUser={this.props.profileUser}
          showAboutPage={this.showAboutPage}
          showHorseProfile={this.showHorseProfile}
          showPhotoLightbox={this.showPhotoLightbox}
          showUserList={this.showUserList}
          uploadProfilePhoto={this.uploadProfilePhoto}
          userID={this.props.userID}
          users={this.props.users}
        />
      )
    } else {
      return null
    }
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')
  const profileUserID = passedProps.profileUser ? passedProps.profileUser.get('_id') : null

  return {
    activeComponent: localState.get('activeComponent'),
    follows: pouchState.get('follows'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    profileUser: pouchState.getIn(['users', profileUserID]) || passedProps.profileUser || new Map(),
    users: pouchState.get('users'),
    userID
  }
}

export default connect(mapStateToProps)(ProfileContainer)
