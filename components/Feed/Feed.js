import React, { PureComponent } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import {
  StyleSheet,
} from 'react-native';

import RideList from './RideList'
import { brand } from '../../colors'

export default class Feed extends PureComponent {
  constructor (props) {
    super(props)
    this.renderRideList = this.renderRideList.bind(this)
    this.startRefresh = this.startRefresh.bind(this)
  }

  startRefresh () {
    this.props.syncDBPull()
  }

  renderRideList (ownRideList, rides) {
    return (
      <RideList
        horses={this.props.horses}
        horseUsers={this.props.horseUsers}
        horseOwnerIDs={this.props.horseOwnerIDs}
        ownRideList={ownRideList}
        refreshing={this.props.refreshing}
        rides={rides}
        rideCarrots={this.props.rideCarrots}
        rideComments={this.props.rideComments}
        showComments={this.props.showComments}
        showHorseProfile={this.props.showHorseProfile}
        showProfile={this.props.showProfile}
        showRide={this.props.showRide}
        startRefresh={this.startRefresh}
        toggleCarrot={this.props.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
      />
    )
  }

  render() {
    return (
      <Container>
        <Tabs initialPage={0} locked={true}>
          <Tab tabStyle={{backgroundColor: brand}} activeTabStyle={{backgroundColor: brand}} heading="Following">
            { this.renderRideList(false, this.props.followingRides) }
          </Tab>
          <Tab tabStyle={{backgroundColor: brand}} activeTabStyle={{backgroundColor: brand}} heading="You">
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
