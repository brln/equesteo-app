import memoizeOne from 'memoize-one'
import { List, Map } from 'immutable'
import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'
import { Alert } from 'react-native'

import BackgroundComponent from '../components/BackgroundComponent'
import Profile from '../components/Profile/Profile'
import {
  clearSearch,
  createFollow,
  createUserPhoto,
  deleteFollow,
  userUpdated,
} from "../actions/standard"
import functional, { DB_SYNCED } from "../actions/functional"
import { brand } from '../colors'
import {
  ABOUT_PAGE,
  FOLLOW_LIST,
  HORSE_PROFILE,
  PHOTO_LIGHTBOX,
  PROFILE,
  UPDATE_PROFILE
} from '../screens/consts/main'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import { EqNavigation } from '../services'
import Amplitude, {
  DO_USER_LOGOUT,
  HIT_LOG_OUT,
  START_FOLLOWING_SOMEONE,
  VIEW_USER_PROFILE,
} from "../services/Amplitude"
import {viewHorseOwnerIDs, viewTrainings} from '../dataViews/dataViews'

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

    this.memoFollowers = memoizeOne(this.followers.bind(this))
    this.memoFollowings = memoizeOne(this.followings.bind(this))
    this.memoOneDegreeUser = memoizeOne(this.oneDegreeUser.bind(this))
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
      if (props.needsRemotePersist === DB_SYNCED) {
        newOptions.topBar.rightButtons.push({
          id: 'logout',
          text: 'Log Out',
          color: 'white'
        })
      }
      Navigation.mergeOptions(props.componentId, newOptions)
    }
  }

  componentDidMount () {
    if (this.props.userID !== this.props.profileUser.get('_id')) {
      Amplitude.logEvent(VIEW_USER_PROFILE)
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
    }).catch(() => {})
  }

  showAboutPage () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: ABOUT_PAGE,
      }
    }).catch(() => {})
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'edit') {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: UPDATE_PROFILE,
          screen: UPDATE_PROFILE,
          title: 'Update Profile',
        }
      }).catch(() => {})
    } else if (buttonId === 'logout') {
      Amplitude.logEvent(HIT_LOG_OUT)
      Alert.alert(
        'Log Out?',
        'The only reason to log out is if you\'re moving to another device.\n\n All ride data will be deleted from the device, and must be re-downloaded when you sign back in.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: this.doLogout,
            style: 'destructive',
          },
        ],
        {cancelable: true},
      )
    }
  }

  doLogout () {
    Amplitude.logEvent(DO_USER_LOGOUT)
    this.props.dispatch(functional.signOut())
  }

  createFollow (followingID) {
    Amplitude.logEvent(START_FOLLOWING_SOMEONE)
    const followID = `${this.props.userID}_${followingID}`
    this.props.dispatch(createFollow(followID, followingID, this.props.userID))
    this.props.dispatch(functional.persistFollow(followID, true))
    this.props.dispatch(clearSearch())
  }

  deleteFollow (followingID) {
    const followID = `${this.props.userID}_${followingID}`
    this.props.dispatch(deleteFollow(followID))
    this.props.dispatch(functional.persistFollow(followID, false))
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
    this.props.dispatch(functional.persistUserWithPhoto(userID, photoID, true))
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
      }).catch(() => {})
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
    }).catch(() => {})
  }

  showHorseProfile (horse, ownerID) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID,
          popBackTo: this.props.componentId
        },
      }
    }).catch(() => {})
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

  thisUsersPhotos (userPhotos, profileUser) {
    return userPhotos.filter((photo) => {
      return photo.get('deleted') !== true && photo.get('userID') === profileUser.get('_id')
    })
  }

  trainings () {
    return viewTrainings(
      this.props.trainings,
      this.props.users,
      this.props.rides,
      this.props.rideHorses,
      this.props.horses,
      this.props.horseUsers,
    ).get(this.props.profileUser.get('_id')).reduce((accum, t) => {
      const day = moment(t.get('startTime')).hour(0).minute(0).second(0).millisecond(0).toISOString()
      accum.get(day) ? accum = accum.set(day, accum.get(day).push(t)) : accum = accum.set(day, List([t]))
      return accum
    }, Map())
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
          horseOwnerIDs={viewHorseOwnerIDs(this.props.horseUsers)}
          horsePhotos={this.props.horsePhotos}
          leaderboardProfile={this.props.leaderboardProfile}
          oneDegreeUser={this.memoOneDegreeUser(this.props.profileUser, this.props.userID, this.props.follows)}
          profilePhotoURL={this.props.profilePhotoURL}
          profileUser={this.props.profileUser}
          showAboutPage={this.showAboutPage}
          showHorseProfile={this.showHorseProfile}
          showPhotoLightbox={this.showPhotoLightbox}
          showUserList={this.showUserList}
          trainings={this.trainings()}
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
    rides: pouchState.get('rides'),
    rideHorses: pouchState.get('rideHorses'),
    trainings: pouchState.get('trainings'),
    users: pouchState.get('users'),
    userID,
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(ProfileContainer)
