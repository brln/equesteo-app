import { List, Map } from 'immutable'
import memoizeOne from 'memoize-one'
import React from 'react'
import { Keyboard, Platform } from 'react-native'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'
import Permissions, { PERMISSIONS } from 'react-native-permissions'


import Amplitude, {
  OPEN_LEADERBOARDS,
  OPEN_NOTIFICATIONS,
  OPEN_TRAINING_PAGE,
  PULL_DOWN_FOR_SYNC,
  START_OR_CONTINUE_RIDE
} from "../../services/Amplitude"
import functional from "../../actions/functional"
import BackgroundComponent from '../../components/BackgroundComponent'
import { brand } from '../../colors'
import Feed from '../../components/Feed/Feed'
import { logRender, unixTimeNow } from '../../helpers'
import {
  HORSE_PROFILE,
  LEADERBOARDS, LOCATION_PERMISSIONS,
  MORE,
  NOTIFICATION_BUTTON,
  NOTIFICATIONS_LIST,
  PROFILE,
  RECORDER,
  RIDE,
  RIDE_BUTTON,
  TRAINING,
} from '../../screens/consts/main'
import {
  INTRO_PAGE
} from '../../screens/consts/firstStart'
import { EqNavigation } from '../../services'
import { captureBreadcrumb } from '../../services/Sentry'
import { viewHorseOwnerIDs } from "../../dataViews/dataViews"
import {Logger} from "../../mixins/Logger"

export const END_OF_FEED = unixTimeNow() - (1000 * 60 * 60 * 24 * 30)

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
    Keyboard.dismiss()
  }

  constructor (props) {
    super(props)
    Object.assign(this, Logger)
    this.logError = this.logError.bind(this)
    this.logInfo = this.logInfo.bind(this)

    this.state = {
      refreshing: false,
      lastFullSync: null,
      firstStartPopped: false,
      ridePopped: false,
    }

    this.followIDs = this.followIDs.bind(this)
    this.followingRides = this.followingRides.bind(this)
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

    this.memoizeFollowingRideHorses = memoizeOne(this.followingRideHorses)
    this.memoizeFollowIDs = memoizeOne(this.followIDs)
    this.memoizeFollowingRides = memoizeOne(this.followingRides)
    this.memoizeFilteredHorses = memoizeOne(this.filteredHorses)
    this.memoizeFilteredHorseUsers = memoizeOne(this.filteredHorseUsers)
    this.memoizeYourRides = memoizeOne(this.yourRides)
    this.memoizeYourRideHorses = memoizeOne(this.yourRideHorses)

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
  }



  openScreen (openPromise) {
    openPromise.then(() => {
      return this.makeSureDrawerClosed()
    }).catch(e => {
      this.logError(e, 'Feed.Feed.openScreen')
    })
  }

  openRecorder () {
    Permissions.check(Platform.select({android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, ios: PERMISSIONS.IOS.LOCATION_ALWAYS})).then(response => {
      if (response === 'granted') {
        Amplitude.logEvent(START_OR_CONTINUE_RIDE)
        this.openScreen(EqNavigation.push(this.props.activeComponent, {
          component: {
            name: RECORDER,
            id: RECORDER
          }
        }))
      } else {
        this.openScreen(EqNavigation.push(this.props.activeComponent, {
          component: {
            name: LOCATION_PERMISSIONS,
            id: LOCATION_PERMISSIONS,
            passProps: {
              response
            }
          }
        }))
      }
    }).catch(e => {
      console.log(e)
    })
  }

  openNotifications () {
    Amplitude.logEvent(OPEN_NOTIFICATIONS)
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: NOTIFICATIONS_LIST,
        id: NOTIFICATIONS_LIST,
      }
    }))
  }


  openTraining () {
    Amplitude.logEvent(OPEN_TRAINING_PAGE)
    this.openScreen(EqNavigation.push(this.props.activeComponent, {
      component: {
        name: TRAINING,
        id: TRAINING
      }
    }))
  }

  openLeaderboards () {
    Amplitude.logEvent(OPEN_LEADERBOARDS)
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
          ownerID,
          popBackTo: this.props.componentId
        }
      }
    }))
  }

  showFirstStart () {
     this.openScreen(EqNavigation.push(this.props.componentId, {
       component: {
         name: INTRO_PAGE,
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
    Amplitude.logEvent(PULL_DOWN_FOR_SYNC)
    this.setState({
      refreshing: true
    })
    this.props.dispatch(functional.pulldownSync())
  }

  toggleCarrot (rideID) {
    this.props.dispatch(functional.toggleRideCarrot(rideID))
  }

  yourRides (rides, userID) {
    return rides.valueSeq().filter(
      (r) => r.get('userID') === userID && r.get('deleted') !== true
    )
  }

  yourRideHorses (yourRides, rideHorses, horses) {
    const yourRideIDs = yourRides.map(r => r.get('_id'))

    let rideHorsesByRide = Map()
    for (let rideHorse of rideHorses.valueSeq()) {
      if (!rideHorse.get('deleted')) {
        if (!rideHorsesByRide.get(rideHorse.get('rideID'))) {
          rideHorsesByRide = rideHorsesByRide.set(rideHorse.get('rideID'), List())
        }
        const rideList = rideHorsesByRide.get(rideHorse.get('rideID'))
        rideHorsesByRide = rideHorsesByRide.set(rideHorse.get('rideID'), rideList.push(rideHorse))
      }
    }

    let yourRideHorses = Map()
    for (let rideID of yourRideIDs) {
      let rideHorseSet = rideHorsesByRide.get(rideID) || List()
      rideHorseSet = rideHorseSet.sort((a, b) => {
        if (a.get('rideHorseType' === 'rider')) {
          return 1
        } else {
          return a.get('timestamp') - b.get('timestamp')
        }
      }).reduce((a, rh) => {
        const h = horses.get(rh.get('horseID'))
        h ?  a = a.push(h) : null
        return a
      }, List())
      yourRideHorses = yourRideHorses.set(rideID, rideHorseSet)
    }
    return yourRideHorses
  }

  followingRideHorses (followingRides, rideHorses, horses) {
    const yourRideIDs = followingRides.map(r => r.get('_id'))

    let rideHorsesByRide = Map()
    for (let rideHorse of rideHorses.valueSeq()) {
      if (!rideHorse.get('deleted')) {
        if (!rideHorsesByRide.get(rideHorse.get('rideID'))) {
          rideHorsesByRide = rideHorsesByRide.set(rideHorse.get('rideID'), List())
        }
        const rideList = rideHorsesByRide.get(rideHorse.get('rideID'))
        rideHorsesByRide = rideHorsesByRide.set(rideHorse.get('rideID'), rideList.push(rideHorse))
      }
    }

    let followingRideHorses = Map()
    for (let rideID of yourRideIDs) {
      let rideHorseSet = rideHorsesByRide.get(rideID) || List()
      rideHorseSet = rideHorseSet.sort((a, b) => {
        if (a.get('rideHorseType' === 'rider')) {
          return 1
        } else {
          return a.get('timestamp') - b.get('timestamp')
        }
      }).reduce((a, rh) => {
        const h = horses.get(rh.get('horseID'))
        h ?  a = a.push(h) : null
        return a
      }, List())
      followingRideHorses = followingRideHorses.set(rideID, rideHorseSet)
    }
    return followingRideHorses
  }

  followIDs (follows, userID) {
    return follows.valueSeq().filter(
      f => f.get('deleted') !== true && f.get('followerID') === userID
    ).reduce((accum, f) => {
      return accum.set(f.get('followingID'), true)
    }, Map())
  }

  followingRides (follows, userID, rides) {
    return rides.valueSeq().filter(
      r => r.get('isPublic') === true
        && r.get('deleted') !== true
        && (r.get('userID') === userID || this.memoizeFollowIDs(follows, userID).get((r.get('userID')))) // user hasn't removed follow
    )
  }

  filteredHorses (follows, userID, horseUsers, horses) {
    return horseUsers.filter(h => {
      return this.memoizeFollowIDs(follows, userID).get(h.get('userID')) || h.get('userID') === userID
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horses.get(horseUser.get('horseID'))]
    })
  }

  filteredHorseUsers (follows, userID, horseUsers, horses) {
    const followIDs = this.memoizeFollowIDs(follows, userID)
    return horseUsers.filter(h => {
      if (horses.get(h.get('horseID'))) {
        return h.get('deleted') !== true && (h.get('userID') === userID || followIDs.get(h.get('userID')))
      } else {
        captureBreadcrumb('HorseUser missing horse: ' + h.get('_id'))
      }
    })
  }

  render() {
    logRender('feedContainer')
    const yourRides = this.memoizeYourRides(this.props.rides, this.props.userID)
    const yourRideHorses = this.memoizeYourRideHorses(yourRides, this.props.rideHorses, this.props.horses)
    const followingRides = this.memoizeFollowingRides(this.props.follows, this.props.userID, this.props.rides)
    const followingRideHorses = this.memoizeFollowingRideHorses(followingRides, this.props.rideHorses, this.props.horses)
    const horses = this.memoizeFilteredHorses(this.props.follows, this.props.userID, this.props.horseUsers, this.props.horses)
    return (
      <Feed
        currentRide={this.props.currentRide}
        deleteRide={this.deleteRide}
        endOfFeed={END_OF_FEED}
        feedMessage={this.props.feedMessage}
        followingRides={followingRides}
        followingRideHorses={followingRideHorses}
        horses={horses}
        horsePhotos={this.props.horsePhotos}
        horseOwnerIDs={viewHorseOwnerIDs(this.props.horseUsers)}
        horseUsers={this.memoizeFilteredHorseUsers(this.props.follows, this.props.userID, this.props.horseUsers, this.props.horses)}
        logInfo={this.logInfo}
        logError={this.logError}
        openLeaderboards={this.openLeaderboards}
        openMore={this.openMore}
        openNotifications={this.openNotifications}
        openRecorder={this.openRecorder}
        openTraining={this.openTraining}
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
        yourRides={yourRides}
        yourRideHorses={yourRideHorses}
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
