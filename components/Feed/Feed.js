import React, { PureComponent } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import {
  StyleSheet,
} from 'react-native';

import RideList from './RideList'
import { brand } from '../../colors'
import SyncingStatus from './SyncingStatus'

export default class Feed extends PureComponent {
  constructor (props) {
    super(props)
    this.renderRideList = this.renderRideList.bind(this)
    this.startRefresh = this.startRefresh.bind(this)
  }

  startRefresh () {
    this.props.syncDB()
  }

  renderRideList (ownRideList, rides) {
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
        rideHorses={this.props.rideHorses}
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
    return (
      <Container>
        <Tabs
          initialPage={0}
          locked={true}
          tabBarUnderlineStyle={{backgroundColor: 'white'}}
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
            { this.renderRideList(false, this.props.followingRides) }
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
            { this.renderRideList(true, this.props.yourRides) }
          </Tab>
        </Tabs>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold'
  }
});
