import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import {
  clearFeedMessage,
  popShowRideShown,
  syncDBPull,
  toggleRideCarrot
} from "../actions";
import { brand } from '../colors'
import Feed from '../components/Feed/Feed'
import { logRender } from '../helpers'
import {
  FIND_PEOPLE,
  FIRST_START,
  HORSE_PROFILE,
  PROFILE,
  RIDE_COMMENTS,
  RIDE
} from '../screens'

class FeedContainer extends PureComponent {
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
          icon: require('../img/hamburger.png'),
          color: 'white'
        }],
        rightButtons: [{
          id: 'findFriends',
          icon: require('../img/findPeople.png'),
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
    }
    this.clearFeedMessage = this.clearFeedMessage.bind(this)
    this.filteredHorses = this.filteredHorses.bind(this)
    this.filteredHorseUsers = this.filteredHorseUsers.bind(this)
    this.followIDs = this.followIDs.bind(this)
    this.followingRides = this.followingRides.bind(this)
    this.horseOwnerIDs = this.horseOwnerIDs.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.showComments = this.showComments.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.syncDBPull = this.syncDBPull.bind(this)
    this.yourRides = this.yourRides.bind(this)

    Navigation.events().bindComponent(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
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
     } else if (buttonId === 'findFriends') {
       Navigation.push(this.props.componentId, {
         component: {
           name: FIND_PEOPLE,
         }
       })
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

  clearFeedMessage () {
     this.props.dispatch(clearFeedMessage())
  }

  componentDidUpdate () {
    if (this.props.popShowRideNow && !this.props.awaitingFullSync) {
      const showRide = this.props.rides.get(this.props.popShowRide)
      if (showRide) {
        // PushNotification.showNotification gets called when it shouldn't if the app reboots unexpectedly.
        // This makes popShowRideNow get set when it shouldn't, so make sure we have a ride to show here.
        this.showRide(showRide)

      }
      this.props.dispatch(popShowRideShown())
    }
    if (this.props.user && (!this.state.firstStartPopped && !this.props.user.get('finishedFirstStart'))) {
      this.showFirstStart()
      this.setState({
        firstStartPopped: true
      })
    }
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
    })
  }

  showComments (ride) {
    Navigation.push(this.props.componentId, {
      component: {
        title: 'Comments',
        name: RIDE_COMMENTS,
        passProps: {
         rideID: ride.get('_id')
        }
      }
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
    })
  }

  showRide (ride) {
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        passProps: {rideID: ride.get('_id')}
      }
    });
  }

  syncDBPull () {
    this.setState({
      refreshing: true
    })
    this.props.dispatch(syncDBPull())
  }

  toggleCarrot (rideID) {
    this.props.dispatch(toggleRideCarrot(rideID))
  }

  yourRides () {
    return this.props.rides.valueSeq().filter(
      (r) => r.get('userID') === this.props.userID && r.get('deleted') !== true
    ).sort((a, b) =>
      b.get('startTime') - a.get('startTime')
    ).toList()
  }

  followIDs () {
    return this.props.follows.valueSeq().filter(
      f => f.get('deleted') !== true && f.get('followerID') === this.props.userID
    ).map(
      f => f.get('followingID')
    ).toList()
  }

  followingRides () {
    return this.props.rides.valueSeq().filter(
      r => r.get('isPublic') === true // is a public ride @TODO: filter this when replicating
        && r.get('deleted') !== true // hasn't been deleted
        && (r.get('userID') === this.props.userID || this.followIDs().indexOf(r.get('userID')) >= 0) // user hasn't removed follow
    ).sort(
      (a, b) => b.get('startTime') - a.get('startTime')
    ).toList()
  }

  filteredHorses () {
    return this.props.horseUsers.filter(h => {
      return this.followIDs().indexOf(h.get('userID')) >= 0 || h.get('userID') === this.props.userID
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), this.props.horses.get(horseUser.get('horseID'))]
    })
  }

  filteredHorseUsers () {
    return this.props.horseUsers.filter(h => {
      return this.followIDs().indexOf(h.get('userID')) >= 0 || h.get('userID') === this.props.userID
    })
  }


  horseOwnerIDs () {
    return this.props.horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  render() {
    logRender('feedContainer')
    return (
      <Feed
        clearFeedMessage={this.clearFeedMessage}
        deleteRide={this.deleteRide}
        feedMessage={this.props.feedMessage}
        followingRides={this.followingRides()}
        horses={this.filteredHorses()}
        horseOwnerIDs={this.horseOwnerIDs()}
        horseUsers={this.filteredHorseUsers()}
        refreshing={this.state.refreshing}
        rideCarrots={this.props.rideCarrots.toList()}
        rideComments={this.props.rideComments.toList()}
        showHorseProfile={this.showHorseProfile}
        showComments={this.showComments}
        showProfile={this.showProfile}
        showRide={this.showRide}
        syncDBPull={this.syncDBPull}
        toggleCarrot={this.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
        yourRides={this.yourRides()}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  return {
    awaitingFullSync: localState.get('awaitingFullSync'),
    feedMessage: localState.get('feedMessage'),
    follows: mainState.get('follows'),
    fullSyncFail: localState.get('fullSyncFail'),
    horses: mainState.get('horses'),
    horseUsers: mainState.get('horseUsers'),
    justFinishedRide: localState.get('justFinishedRide'),
    lastFullSync: localState.get('lastFullSync'),
    popShowRide: localState.get('popShowRide'),
    popShowRideNow: localState.get('popShowRideNow'),
    rides: mainState.get('rides'),
    rideCarrots: mainState.get('rideCarrots'),
    rideComments: mainState.get('rideComments'),
    users: mainState.get('users'),
    userID,
    user: mainState.getIn(['users', localState.get('userID')])
  }
}

export default connect(mapStateToProps)(FeedContainer)
