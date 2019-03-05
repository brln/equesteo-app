import memoizeOne from 'memoize-one'
import React from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import { pulldownSync, toggleRideCarrot } from "../../actions/functional"
import BackgroundComponent from '../../components/BackgroundComponent'
import { brand } from '../../colors'
import Feed from '../../components/Feed/Feed'
import { logRender } from '../../helpers'
import {
  FIRST_START,
  HORSE_PROFILE,
  PROFILE,
  RECORDER,
  RIDE,
  RIDE_BUTTON,
} from '../../screens'

class FeedContainer extends BackgroundComponent {
   static options() {
    return {
      topBar: {
        title: {
          text: "Feed",
          color: 'white',
          fontSize: 20
        },
        leftButtons: [{
          id: 'sideMenu',
          icon: require('../../img/hamburger.png'),
          color: 'white'
        }],
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

  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      lastFullSync: null,
      firstStartPopped: false,
      ridePopped: false,
      recorderDebounce: false,
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
    this.openRecorder = this.openRecorder.bind(this)
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
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [{
          component: {
            id: RIDE_BUTTON,
            name: RIDE_BUTTON,
            passProps: {
              onPress: this.openRecorder,
            }
          }
        }],
      }
    })
  }

  openRecorder () {
    if (!this.state.recorderDebounce) {
      this.setState({
        recorderDebounce: true
      })
      Navigation.push(this.props.activeComponent, {
        component: {
          name: RECORDER,
          id: RECORDER
        }
      }).then(() => {
        Navigation.mergeOptions(this.props.componentId, {
          sideMenu: {
            left: {
              visible: false,
            }
          }
        })
        this.setState({
          recorderDebounce: false
        })
      })
    }
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
    if (this.props.popShowRideNow && this.props.popShowRide && this.props.popShowRide.get('rideID')) {
      const showRide = this.props.rides.get(this.props.popShowRide.get('rideID'))
      if (showRide && !this.state.ridePopped) {
        // PushNotification.showNotification gets called when it shouldn't if the app reboots unexpectedly.
        // This makes popShowRideNow get set when it shouldn't, so make sure we have a ride to show here.
        this.showRide(showRide, this.props.popShowRide.get('scrollToComments'), true)
        this.setState({
          ridePopped: true
        })
      }
    } else if (this.state.ridePopped) {
      this.setState({
        ridePopped: false
      })
    }

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

  showHorseProfile (horse, ownerID) {
    Navigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID
        }
      }
    }).then(() => {
      this.makeSureDrawerClosed()
    })
  }

  showFirstStart () {
     Navigation.push(this.props.componentId, {
       component: {
         name: FIRST_START,
       }
     })
  }

  showProfile (user) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: user,
        }
      }
    }).then(() => {
      this.makeSureDrawerClosed()
    })
  }

  showRide (ride, skipToComments, isPopShow) {
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        passProps: {
          rideID: ride.get('_id'),
          skipToComments,
          isPopShow,
        }
      }
    }).then(() => {
      this.makeSureDrawerClosed()
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

  rideHorses (rideHorses) {
    return rideHorses.filter(rh => {
      return rh.get('deleted') !== true
    })
  }

  render() {
    logRender('feedContainer')
    return (
      <Feed
        deleteRide={this.deleteRide}
        feedMessage={this.props.feedMessage}
        followingRides={this.memoizeFollowingRides(this.props.follows, this.props.userID, this.props.rides)}
        horses={this.memoizeFilteredHorses(this.props.follows, this.props.userID, this.props.horseUsers, this.props.horses)}
        horsePhotos={this.props.horsePhotos}
        horseOwnerIDs={this.memoizeHorseOwnerIDs(this.props.horseUsers)}
        horseUsers={this.memoizeFilteredHorseUsers(this.props.follows, this.props.userID, this.props.horseUsers)}
        rideHorses={this.memoizeRideHorses(this.props.rideHorses)}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots.toList()}
        rideComments={this.props.rideComments.toList()}
        ridePhotos={this.props.ridePhotos}
        showHorseProfile={this.showHorseProfile}
        showComments={this.showComments}
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
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const userID = localState.get('userID')
  return {
    activeComponent: localState.get('activeComponent'),
    feedMessage: localState.get('feedMessage'),
    follows: pouchState.get('follows'),
    fullSyncFail: localState.get('fullSyncFail'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    justFinishedRide: localState.get('justFinishedRide'),
    lastFullSync: localState.get('lastFullSync'),
    popShowRide: localState.get('popShowRide'),
    popShowRideNow: localState.get('popShowRideNow'),
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
