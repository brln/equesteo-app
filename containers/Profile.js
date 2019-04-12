import memoizeOne from 'memoize-one'
import { List, Map } from 'immutable'
import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import BackgroundComponent from '../components/BackgroundComponent'
import Profile from '../components/Profile/Profile'
import {
  clearSearch,
  createFollow,
  createUserPhoto,
  deleteFollow,
  userUpdated,
} from "../actions/standard"
import {
  DB_NEEDS_SYNC,
  persistFollow,
  persistUserWithPhoto,
  signOut,
} from "../actions/functional"
import { brand } from '../colors'
import {
  ABOUT_PAGE,
  FOLLOW_LIST,
  HORSE_PROFILE,
  PHOTO_LIGHTBOX,
  PROFILE,
  UPDATE_PROFILE
} from '../screens'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import { EqNavigation } from '../services'

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
    this.createFollow = this.createFollow.bind(this)
    this.deleteFollow = this.deleteFollow.bind(this)
    this.doLogout = this.doLogout.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.oneDegreeUser = this.oneDegreeUser.bind(this)
    this.showAboutPage = this.showAboutPage.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
    this.showUserList = this.showUserList.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    this.memoHorseOwnerIDs = memoizeOne(this.horseOwnerIDs.bind(this))
    this.memoFollowers = memoizeOne(this.followers.bind(this))
    this.memoFollowings = memoizeOne(this.followings.bind(this))
    this.memoOneDegreeUser = memoizeOne(this.oneDegreeUser.bind(this))
    this.memoTrainings = memoizeOne(this.trainings.bind(this))
    this.memoProfileUserHorses = memoizeOne(this.profileUserHorses.bind(this))
    this.memoThisUsersPhotos = memoizeOne(this.thisUsersPhotos.bind(this))

    Navigation.events().bindComponent(this);

    if (props.userID === props.profileUser.get('_id')) {
      const newOptions = {
        topBar: {
          rightButtons: [
            {
              id: 'edit',
              text: 'Edit',
              color: 'white'
            }
          ]
        }
      }
      if (props.needsRemotePersist === 'DB_SYNCED') {
        newOptions.topBar.rightButtons.push({
          id: 'logout',
          text: 'Log Out',
          color: 'white'
        })
      }
      Navigation.mergeOptions(props.componentId, newOptions)
    }
  }

  showPhotoLightbox (sources) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources,
        }
      }
    })
  }

  showAboutPage () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: ABOUT_PAGE,
      }
    })
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'edit') {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: UPDATE_PROFILE,
          screen: UPDATE_PROFILE,
          title: 'Update Profile',
        }
      });
    } else if (buttonId === 'logout') {
      this.doLogout()
    }
  }

  doLogout () {
    this.props.dispatch(signOut())
  }

  createFollow (followingID) {
    const followID = `${this.props.userID}_${followingID}`
    this.props.dispatch(createFollow(followID, followingID, this.props.userID))
    this.props.dispatch(persistFollow(followID, true))
    this.props.dispatch(clearSearch())
  }

  deleteFollow (followingID) {
    const followID = `${this.props.userID}_${followingID}`
    this.props.dispatch(deleteFollow(followID))
    this.props.dispatch(persistFollow(followID, false))
  }

  uploadPhoto (location) {
    let photoID = generateUUID()
    let userID = this.props.profileUser.get('_id')
    this.props.dispatch(createUserPhoto(
      userID,
      {
        _id: photoID,
        timestamp: unixTimeNow(),
        uri: location
      }
    ))
    this.props.dispatch(userUpdated(this.props.profileUser.set('profilePhotoID', photoID)))
    this.props.dispatch(persistUserWithPhoto(userID, photoID))
  }

  showProfile (profileUser) {
    return () => {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: PROFILE,
          passProps: {
            profileUser,
          }
        }
      })
    }
  }

  showUserList (followRecords, followingOrFollower) {
    const userIDs = followRecords.valueSeq().map((f) => f.get(followingOrFollower))
    EqNavigation.push(this.props.componentId, {
      component: {
        name: FOLLOW_LIST,
        passProps: {
          userIDs: userIDs.toJS(),
          onPress: this.showProfile
        }
      }
    })
  }

  showHorseProfile (horse, ownerID) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {horse, ownerID},
      }
    })
  }

  profileUserHorses (horseUsers, profileUser, horses) {
    return horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === profileUser.get('_id')) && hu.get('owner') === true && hu.get('deleted') !== true
    }).map((hu) => {
      if (!horses.get(hu.get('horseID'))) {
        throw Error('Don\'t have a horse that should be here.')
      }
      return horses.get(hu.get('horseID'))
    }).toList()
  }

  followings (follows, profileUser) {
    return follows.filter(f =>
      !f.get('deleted') && f.get('followerID') === profileUser.get('_id')
    )
  }

  followers (follows, profileUser) {
    return follows.filter(f =>
      !f.get('deleted') && f.get('followingID') === profileUser.get('_id')
    )
  }

  oneDegreeUser (profileUser, userID, follows) {
    if (profileUser.get('_id') === userID) {
      return true
    }

    let oneDegree = false
    follows.forEach((follow) => {
      if (!follow.get('deleted')) {
        const followerID = follow.get('followerID')
        const followingID = follow.get('followingID')
        if (followerID === userID && followingID === profileUser.get('_id')) {
          oneDegree = true
        } else if (followingID === userID && followerID === profileUser.get('_id'))  {
          oneDegree = true
        }
      }
    })
    return oneDegree
  }

  horseOwnerIDs (horseUsers) {
    return horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  thisUsersPhotos (userPhotos, profileUser) {
    return userPhotos.filter((photo) => {
      return photo.get('deleted') !== true && photo.get('userID') === profileUser.get('_id')
    })
  }

  trainings (trainings, userID) {
    const trainingDoc = trainings.get(`${userID}_training`)
    if (trainingDoc) {
      return trainingDoc.get('rides').filter(t => {
        return t.get('deleted') !== true && t.get('riderHorseID') && t.get('userID') === this.props.profileUser.get('_id')
      }).reduce((accum, t) => {
        const day = moment(t.get('startTime')).hour(0).minute(0).second(0).millisecond(0).toISOString()
        accum.get(day) ? accum = accum.set(day, accum.get(day).push(t)) : accum = accum.set(day, List([t]))
        return accum
      }, Map())
    }
  }

  render() {
    logRender('ProfileContainer')
    if (this.props.profileUser.get('_id')) {
      return (
        <Profile
          createFollow={this.createFollow}
          deleteFollow={this.deleteFollow}
          doLogout={this.doLogout}
          followings={this.memoFollowings(this.props.follows, this.props.profileUser)}
          followingSyncRunning={this.props.followingSyncRunning}
          followers={this.memoFollowers(this.props.follows, this.props.profileUser)}
          horses={this.memoProfileUserHorses(this.props.horseUsers, this.props.profileUser, this.props.horses)}
          horseOwnerIDs={this.memoHorseOwnerIDs(this.props.horseUsers)}
          horsePhotos={this.props.horsePhotos}
          leaderboardProfile={this.props.leaderboardProfile}
          oneDegreeUser={this.memoOneDegreeUser(this.props.profileUser, this.props.userID, this.props.follows)}
          profilePhotoURL={this.props.profilePhotoURL}
          profileUser={this.props.profileUser}
          showAboutPage={this.showAboutPage}
          showHorseProfile={this.showHorseProfile}
          showPhotoLightbox={this.showPhotoLightbox}
          showUserList={this.showUserList}
          trainings={this.memoTrainings(this.props.trainings, this.props.profileUser.get('_id'))}
          uploadPhoto={this.uploadPhoto}
          userID={this.props.userID}
          users={this.props.users}
          userPhotos={this.memoThisUsersPhotos(this.props.userPhotos, this.props.profileUser)}
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
    followingSyncRunning: localState.get('followingSyncRunning'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    leaderboardProfile: passedProps.leaderboardProfile,
    needsRemotePersist: localState.get('needsRemotePersist'),
    photoQueue: localState.get('photoQueue'),
    profilePhotoURL: passedProps.profilePhotoURL,
    profileUser: pouchState.getIn(['users', profileUserID]) || passedProps.profileUser || new Map(),
    trainings: pouchState.get('trainings'),
    users: pouchState.get('users'),
    userID,
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(ProfileContainer)
