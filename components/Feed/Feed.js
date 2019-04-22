import React, { PureComponent } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import {
  StatusBar,
} from 'react-native';

import { isAndroid } from '../../helpers'
import RideList from './RideList'
import { brand } from '../../colors'
import SyncingStatus from './SyncingStatus'
import TabBar from './TabBar'
import NotificationButton from '../../containers/Feed/NotificationButton'

export default class Feed extends PureComponent {
  constructor (props) {
    super(props)
    this.renderRideList = this.renderRideList.bind(this)
    this.startRefresh = this.startRefresh.bind(this)
  }

  startRefresh () {
    this.props.syncDB()
  }

  renderRideList (ownRideList, rides, rideHorses) {
    return (
      <RideList
        horses={this.props.horses}
        horsePhotos={this.props.horsePhotos}
        horseUsers={this.props.horseUsers}
        horseOwnerIDs={this.props.horseOwnerIDs}
        ownRideList={ownRideList}
        refreshing={this.props.refreshing}
        rides={rides}
        rideCarrots={this.props.rideCarrots}
        rideComments={this.props.rideComments}
        rideHorses={rideHorses}
        ridePhotos={this.props.ridePhotos}
        showComments={this.props.showComments}
        showHorseProfile={this.props.showHorseProfile}
        showProfile={this.props.showProfile}
        showRide={this.props.showRide}
        startRefresh={this.startRefresh}
        toggleCarrot={this.props.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
        userPhotos={this.props.userPhotos}
      />
    )
  }

  render() {
    let statusBar = null
    if (!isAndroid()) {
      statusBar = <StatusBar backgroundColor={brand} barStyle="light-content" />
    }
    return (
      <Container>
        { statusBar }
        <Tabs
          initialPage={0}
          locked={true}
          tabBarUnderlineStyle={{backgroundColor: 'white'}}
          style={{flex: 10}}
        >
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            heading="Following"
            activeTextStyle={{color: 'white'}}
          >
            <SyncingStatus
              feedMessage={this.props.feedMessage}
              visible={this.props.feedMessage}
            />
            { this.renderRideList(false, this.props.followingRides, this.props.followingRideHorses) }
          </Tab>
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            activeTextStyle={{color: 'white'}}
            heading="You"
          >
            <SyncingStatus
              clearFeedMessage={this.props.clearFeedMessage}
              feedMessage={this.props.feedMessage}
              visible={this.props.feedMessage}
            />
            { this.renderRideList(true, this.props.yourRides, this.props.yourRideHorses) }
          </Tab>
        </Tabs>
        <NotificationButton
          onPress={this.props.openNotifications}
        />
        <TabBar
          currentRide={this.props.currentRide}
          openLeaderboards={this.props.openLeaderboards}
          openMore={this.props.openMore}
          openRecorder={this.props.openRecorder}
          openTraining={this.props.openTraining}
        />
      </Container>
    )
  }
}

