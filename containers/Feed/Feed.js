import memoizeOne from 'memoize-one'
import React from 'react'
import { Keyboard, Platform } from 'react-native'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import {checkFCMPermission, pulldownSync, toggleRideCarrot} from "../../actions/functional"
import BackgroundComponent from '../../components/BackgroundComponent'
import { brand } from '../../colors'
import Feed from '../../components/Feed/Feed'
import { logError, logRender } from '../../helpers'
import {
  FIRST_START,
  HORSE_PROFILE,
  LEADERBOARDS,
  MORE,
  NOTIFICATION_BUTTON,
  NOTIFICATIONS_LIST,
  PROFILE,
  RECORDER,
  RIDE,
  RIDE_BUTTON,
  TRAINING,
} from '../../screens'
import { EqNavigation } from '../../services'

class FeedContainer extends BackgroundComponent {
   static options() {
    return {
      topBar: {
        title: {
          text: "Feed",
          color: 'white',
          fontSize: 20
        },
        leftButtons: Platform.select({
          android: [{
            id: 'sideMenu',
            icon: require('../../img/hamburger.png'),
            color: 'white'
          }],
          ios: [],
        }),
        background: {
          color: brand,
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  componentDidAppear() {
    Keyboard.dismiss();
  }

  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      lastFullSync: null,
      firstStartPopped: false,
      ridePopped: false,
    }

    this.followIDs = this.followIDs.bind(this)
    this.followingRides = this.followingRides.bind(this)
    this.horseOwnerIDs = this.horseOwnerIDs.bind(this)
    this.filteredHorses = this.filteredHorses.bind(this)
    this.filteredHorseUsers = this.filteredHorseUsers.bind(this)
    this.makeSureDrawerClosed = this.makeSureDrawerClosed.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.syncDB = this.syncDB.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.openLeaderboards = this.openLeaderboards.bind(this)
    this.openMore = this.openMore.bind(this)
    this.openNotifications = this.openNotifications.bind(this)
    this.openRecorder = this.openRecorder.bind(this)
    this.openTraining = this.openTraining.bind(this)
    this.yourRides = this.yourRides.bind(this)

    this.memoizeFollowIDs = memoizeOne(this.followIDs)
    this.memoizeFollowingRides = memoizeOne(this.followingRides)
    this.memoizeHorseOwnerIDs = memoizeOne(this.horseOwnerIDs)
    this.memoizeFilteredHorses = memoizeOne(this.filteredHorses)
    this.memoizeFilteredHorseUsers = memoizeOne(this.filteredHorseUsers)
    this.memoizeRideHorses = memoizeOne(this.rideHorses.bind(this))
    this.memoizeYourRides = memoizeOne(this.yourRides)

    Navigation.events().bindComponent(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    Navigation.mergeOptions(this.props.componentId,
      Platform.select({
        android: {
          topBar: {
            rightButtons: [
              {
                component: {
                  id: RIDE_BUTTON,
                  name: RIDE_BUTTON,
                  passProps: {
                    onPress: this.openRecorder,
                  }
                }
              },
            ],
          }
        },
        ios: {
          topBar: {
            rightButtons: [
              {
                id: 'some random ID',
                component: {
                  id: NOTIFICATION_BUTTON,
                  name: NOTIFICATION_BUTTON,
                  passProps: {
                    onPress: this.openNotifications,
                  }
                }
              },
            ],
          }
        },
      })
    )
    props.dispatch(checkFCMPermission())
  }

  openScreen (openPromise) {
    openPromise.then(() => {
      return this.makeSureDrawerClosed()
    }).catch(e => {
      logError(e)
    })
  }

  openRecorder () {
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: RECORDER,
        id: RECORDER
      }
    }))
  }

  openNotifications () {
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: NOTIFICATIONS_LIST,
        id: NOTIFICATIONS_LIST,
      }
    }))
  }


  openTraining () {
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: TRAINING,
        id: TRAINING
      }
    }))
  }

  openLeaderboards () {
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: LEADERBOARDS,
        id: LEADERBOARDS
      }
    }))
  }
  
  openMore () {
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: MORE,
        id: MORE,
      }
    }))
  }

  showHorseProfile (horse, ownerID) {
    this.openScreen(EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID
        }
      }
    }))
  }

  showFirstStart () {
     this.openScreen(EqNavigation.push(this.props.componentId, {
       component: {
         name: FIRST_START,
       }
     }))
  }

  showProfile (user) {
    this.openScreen(EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: user,
        }
      }
    }))
  }

  showRide (ride, skipToComments) {
    this.openScreen(EqNavigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        passProps: {
          rideID: ride.get('_id'),
          skipToComments,
        }
      }
    }))
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'sideMenu') {
      Navigation.mergeOptions(this.props.componentId, {
        sideMenu: {
          left: {
            visible: true,
          }
        }
      });
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const nextState = {}
    nextState.lastFullSync = nextProps.lastFullSync
    if (prevState.lastFullSync !== nextProps.lastFullSync || nextProps.fullSyncFail) {
      nextState.refreshing = false
    }
    return nextState
  }

  componentDidUpdate () {
    if (this.props.user && (!this.state.firstStartPopped && !this.props.user.get('finishedFirstStart'))) {
      this.showFirstStart()
      this.setState({
        firstStartPopped: true
      })
    }
  }

  makeSureDrawerClosed () {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: false,
        }
      }
    })
  }



  syncDB () {
    this.setState({
      refreshing: true
    })
    this.props.dispatch(pulldownSync())
  }

  toggleCarrot (rideID) {
    this.props.dispatch(toggleRideCarrot(rideID))
  }

  yourRides (rides, userID) {
    return rides.valueSeq().filter(
      (r) => r.get('userID') === userID && r.get('deleted') !== true
    ).sort((a, b) =>
      b.get('startTime') - a.get('startTime')
    ).toList().slice(0, 30)
  }

  followIDs (follows, userID) {
    return follows.valueSeq().filter(
      f => f.get('deleted') !== true && f.get('followerID') === userID
    ).map(
      f => f.get('followingID')
    ).toList()
  }

  followingRides (follows, userID, rides) {
    return rides.valueSeq().filter(
      r => r.get('isPublic') === true // is a public ride
        && r.get('deleted') !== true // hasn't been deleted
        && (r.get('userID') === userID || this.memoizeFollowIDs(follows, userID).indexOf(r.get('userID')) >= 0) // user hasn't removed follow
    ).sort(
      (a, b) => b.get('startTime') - a.get('startTime')
    ).toList().slice(0, 50)
  }

  filteredHorses (follows, userID, horseUsers, horses) {
    return horseUsers.filter(h => {
      return this.memoizeFollowIDs(follows, userID).indexOf(h.get('userID')) >= 0 || h.get('userID') === userID
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horses.get(horseUser.get('horseID'))]
    })
  }

  filteredHorseUsers (follows, userID, horseUsers) {
    return horseUsers.filter(h => {
      return this.memoizeFollowIDs(follows, userID).indexOf(h.get('userID')) >= 0 || h.get('userID') === userID
    })
  }


  horseOwnerIDs (horseUsers) {
    return horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  rideHorses (rHorses) {
    return rHorses.filter(rh => {
      return rh.get('deleted') !== true
    })
  }

  render() {
    logRender('feedContainer')
    return (
      <Feed
        currentRide={this.props.currentRide}
        deleteRide={this.deleteRide}
        feedMessage={this.props.feedMessage}
        followingRides={this.memoizeFollowingRides(this.props.follows, this.props.userID, this.props.rides)}
        horses={this.memoizeFilteredHorses(this.props.follows, this.props.userID, this.props.horseUsers, this.props.horses)}
        horsePhotos={this.props.horsePhotos}
        horseOwnerIDs={this.memoizeHorseOwnerIDs(this.props.horseUsers)}
        horseUsers={this.memoizeFilteredHorseUsers(this.props.follows, this.props.userID, this.props.horseUsers)}
        openLeaderboards={this.openLeaderboards}
        openMore={this.openMore}
        openNotifications={this.openNotifications}
        openRecorder={this.openRecorder}
        openTraining={this.openTraining}
        rideHorses={this.memoizeRideHorses(this.props.rideHorses)}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots.toList()}
        rideComments={this.props.rideComments.toList()}
        ridePhotos={this.props.ridePhotos}
        showHorseProfile={this.showHorseProfile}
        showProfile={this.showProfile}
        showRide={this.showRide}
        syncDB={this.syncDB}
        toggleCarrot={this.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
        userPhotos={this.props.userPhotos}
        yourRides={this.memoizeYourRides(this.props.rides, this.props.userID)}
      />
    )
  }
}

function mapStateToProps (state) {
  const currentRideState = state.get('currentRide')
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const userID = localState.get('userID')
  return {
    activeComponent: localState.get('activeComponent'),
    currentRide: currentRideState.get('currentRide'),
    feedMessage: localState.get('feedMessage'),
    follows: pouchState.get('follows'),
    fullSyncFail: localState.get('fullSyncFail'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    justFinishedRide: localState.get('justFinishedRide'),
    lastFullSync: localState.get('lastFullSync'),
    rides: pouchState.get('rides'),
    rideCarrots: pouchState.get('rideCarrots'),
    rideComments: pouchState.get('rideComments'),
    rideHorses: pouchState.get('rideHorses'),
    ridePhotos: pouchState.get('ridePhotos'),
    users: pouchState.get('users'),
    userID,
    user: pouchState.getIn(['users', localState.get('userID')]),
    userPhotos: pouchState.get('userPhotos')
  }
}

export default connect(mapStateToProps)(FeedContainer)
